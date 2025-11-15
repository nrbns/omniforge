import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async health() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    };

    const allHealthy = Object.values(checks.services).every((s) => s.status === 'ok');
    return {
      ...checks,
      status: allHealthy ? 'ok' : 'degraded',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async readiness() {
    const db = await this.checkDatabase();
    return {
      ready: db.status === 'ok',
      checks: { database: db },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  liveness() {
    return { alive: true };
  }

  private async checkDatabase(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'ok', latency };
    } catch (error) {
      return { status: 'error', error: (error as Error).message };
    }
  }

  private async checkRedis(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.redis.get('health-check');
      const latency = Date.now() - start;
      return { status: 'ok', latency };
    } catch (error) {
      return { status: 'error', error: (error as Error).message };
    }
  }
}

