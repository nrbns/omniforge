import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login (demo mode - returns mock token)' })
  async login(@Body() body: { email: string; userId?: string }) {
    // In production, verify credentials
    // For demo mode, generate token
    const userId = body.userId || `user_${Date.now()}`;
    const token = await this.authService.generateToken(userId, body.email);
    
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 604800, // 7 days
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  }
}

