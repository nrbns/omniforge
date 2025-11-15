import { Module } from '@nestjs/common';
import { BuildsController } from './builds.controller';
import { BuildsService } from './builds.service';
import { AgentsModule } from '../agents/agents.module';
import { ScaffoldModule } from '../scaffold/scaffold.module';

@Module({
  imports: [AgentsModule, ScaffoldModule],
  controllers: [BuildsController],
  providers: [BuildsService],
  exports: [BuildsService],
})
export class BuildsModule {}

