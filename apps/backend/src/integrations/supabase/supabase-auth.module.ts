import { Module } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SupabaseAuthService],
  exports: [SupabaseAuthService],
})
export class SupabaseAuthModule {}

