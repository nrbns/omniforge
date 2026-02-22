import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later',
  };

  constructor(
    private redis: RedisService,
    private configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip rate limiting in demo mode for development
    if (this.configService.get<string>('DEMO_MODE') === 'true') {
      return next();
    }

    const config = this.getConfigForRoute(req.path);
    const key = this.getKey(req);

    try {
      const count = await this.redis.incr(key);

      if (count === 1) {
        // Set expiration on first request
        await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());

      if (count > config.max) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: config.message,
            retryAfter: Math.ceil(config.windowMs / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // If Redis fails, allow request (fail open)
      next();
    }
  }

  private getKey(req: Request): string {
    // Use IP address or user ID if authenticated
    const identifier =
      (req as Request & { user?: { id: string } }).user?.id || req.ip || 'anonymous';
    const path = req.path.replace(/\//g, ':');
    return `rate_limit:${path}:${identifier}`;
  }

  private getConfigForRoute(path: string): RateLimitConfig {
    // Stricter limits for auth endpoints
    if (path.includes('/auth/')) {
      return {
        windowMs: 15 * 60 * 1000,
        max: 10, // 10 login attempts per 15 minutes
        message: 'Too many authentication attempts, please try again later',
      };
    }

    // Stricter limits for API endpoints
    if (path.startsWith('/api/')) {
      return {
        windowMs: 15 * 60 * 1000,
        max: 200, // 200 requests per 15 minutes
      };
    }

    return this.defaultConfig;
  }
}
