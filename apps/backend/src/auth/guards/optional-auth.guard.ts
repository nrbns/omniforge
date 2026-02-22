// @ts-nocheck - RxJS version conflict between workspace and Nest deps
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Optional auth guard - allows requests with or without auth
 * User will be available in request.user if authenticated
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  constructor(private configService: ConfigService) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // In demo mode, always allow
    if (this.configService.get<string>('DEMO_MODE') === 'true') {
      return true;
    }

    // Try to authenticate, but don't fail if no token
    try {
      const result = super.canActivate(context);
      if (typeof result === 'boolean') return result;
      if (result instanceof Promise) return await result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await firstValueFrom(result as any);
    } catch {
      return true; // Allow request even if auth fails
    }
  }

  handleRequest(err: any, user: any) {
    // Return user if authenticated, null otherwise
    return user || null;
  }
}

