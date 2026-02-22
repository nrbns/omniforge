import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../integrations/stripe/stripe.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, StripeModule, EmailModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
