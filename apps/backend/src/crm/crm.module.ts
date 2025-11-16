import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { LeadScoringService } from './lead-scoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseAuthModule } from '../integrations/supabase/supabase-auth.module';

@Module({
  imports: [PrismaModule, SupabaseAuthModule],
  controllers: [CrmController],
  providers: [CrmService, LeadScoringService],
  exports: [CrmService, LeadScoringService],
})
export class CrmModule {}
