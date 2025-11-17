import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

/**
 * Optional auth guard - allows requests with or without auth
 * User will be available in request.user if authenticated
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // In demo mode, always allow
    if (this.configService.get<string>('DEMO_MODE') === 'true') {
      return true;
    }

    // Try to authenticate, but don't fail if no token
    return super.canActivate(context).catch(() => {
      return true; // Allow request even if auth fails
    });
  }

  handleRequest(err: any, user: any) {
    // Return user if authenticated, null otherwise
    return user || null;
  }
}

