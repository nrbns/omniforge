import { Module } from '@nestjs/common';
import { ScaffoldController } from './scaffold.controller';
import { ScaffoldService } from './scaffold.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScaffoldController],
  providers: [ScaffoldService],
  exports: [ScaffoldService],
})
export class ScaffoldModule {}

