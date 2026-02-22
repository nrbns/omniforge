import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  clerkId?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  /**
   * Validate user from JWT token
   */
  async validateUser(payload: JwtPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        // If user doesn't exist, create from token (for Clerk integration)
        if (payload.clerkId) {
          return await this.prisma.user.create({
            data: {
              id: payload.sub,
              email: payload.email,
              clerkId: payload.clerkId,
            },
          });
        }
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Generate JWT token for user
   */
  async generateToken(userId: string, email: string, clerkId?: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      clerkId,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify Clerk token (if using Clerk for auth)
   */
  async verifyClerkToken(token: string): Promise<JwtPayload | null> {
    const clerkSecret = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!clerkSecret) {
      // In demo mode, allow requests without auth
      if (this.configService.get<string>('DEMO_MODE') === 'true') {
        return null;
      }
      return null;
    }

    try {
      // In production, verify with Clerk API
      // For now, return null to allow demo mode
      return null;
    } catch (error) {
      this.logger.warn('Clerk token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract user from request (supports both JWT and Clerk)
   */
  async getUserFromRequest(request: any) {
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      // In demo mode, allow anonymous access
      if (this.configService.get<string>('DEMO_MODE') === 'true') {
        return null;
      }
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    // Try JWT first
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      return await this.validateUser(payload);
    } catch (error) {
      // Try Clerk token
      const clerkPayload = await this.verifyClerkToken(token);
      if (clerkPayload) {
        return await this.validateUser(clerkPayload);
      }
      return null;
    }
  }
}
