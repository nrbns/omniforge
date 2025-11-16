import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Idea, Project, Deployment } from '@prisma/client';

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private realtimeService: RealtimeService,
    @InjectQueue('idea-parser') private ideaParserQueue: Queue,
    @InjectQueue('build') private buildQueue: Queue,
    @InjectQueue('deploy') private deployQueue: Queue
  ) {}

  async parseIdea(idea: Idea): Promise<any> {
    // Queue idea parsing job
    await this.ideaParserQueue.add('parse', {
      ideaId: idea.id,
      rawInput: idea.rawInput,
      title: idea.title,
      description: idea.description,
    });

    // For now, return a mock spec structure
    // In production, this will call the actual IdeaParserAgent
    return this.generateMockSpec(idea);
  }

  async buildProject(project: Project & { idea: Idea }, buildId: string): Promise<void> {
    await this.buildQueue.add('build', {
      projectId: project.id,
      buildId,
      ideaId: project.ideaId,
      spec: project.idea.specJson,
      config: project.config,
    });

    // Update build status
    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Emit realtime event
    await this.realtimeService.emit(`build:${buildId}`, 'build.started', {
      id: buildId,
      status: 'RUNNING',
    });
  }

  async deployProject(
    deployment: Deployment & { project: Project & { idea: Idea } }
  ): Promise<void> {
    await this.deployQueue.add('deploy', {
      deploymentId: deployment.id,
      projectId: deployment.projectId,
      platform: deployment.platform,
      config: deployment.config,
    });

    // Update deployment status
    await this.prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'DEPLOYING',
      },
    });

    // Emit realtime event
    await this.realtimeService.emit(`deployment:${deployment.id}`, 'deployment.started', {
      id: deployment.id,
      status: 'DEPLOYING',
    });
  }

  private generateMockSpec(idea: Idea): any {
    return {
      version: '1.0.0',
      name: idea.title,
      description: idea.description || '',
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          components: [],
        },
      ],
      dataModels: [],
      apis: [],
      realtime: [],
      integrations: [],
      ui: {
        theme: 'light',
        primaryColor: '#3b82f6',
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
