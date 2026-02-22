import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportTemplatesService } from './export-templates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
  providers: [ExportService, ExportTemplatesService],
  exports: [ExportService, ExportTemplatesService],
})
export class ExportModule {}
