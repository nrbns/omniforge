import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private sentryInitialized = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeSentry();
  }

  private initializeSentry() {
    const sentryDsn = this.configService.get<string>('SENTRY_DSN');

    if (!sentryDsn) {
      this.logger.log('Sentry DSN not provided, skipping Sentry initialization');
      return;
    }

    try {
      // In production, initialize Sentry
      // For now, just log that it would be initialized
      this.logger.log('Sentry would be initialized with DSN:', sentryDsn.substring(0, 20) + '...');
      this.sentryInitialized = true;
    } catch (error) {
      this.logger.warn('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Capture exception for monitoring
   */
  captureException(error: Error, context?: Record<string, any>) {
    this.logger.error('Exception captured:', {
      error: error.message,
      stack: error.stack,
      context,
    });

    // In production with Sentry:
    // if (this.sentryInitialized) {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * Capture message for monitoring
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, any>
  ) {
    const method = level === 'warning' ? 'warn' : level === 'info' ? 'log' : level;
    this.logger[method](message, context);

    // In production with Sentry:
    // if (this.sentryInitialized) {
    //   Sentry.captureMessage(message, { level, extra: context });
    // }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string) {
    // In production with Sentry:
    // if (this.sentryInitialized) {
    //   Sentry.setUser({ id: userId, email });
    // }
  }
}
