import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { ABTestingService } from './ab-testing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService, ABTestingService],
  exports: [MarketingService, ABTestingService],
})
export class MarketingModule {}
