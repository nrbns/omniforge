import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateDeploymentDto } from './dto';

@Injectable()
export class DeploymentsService {
  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
    private realtimeService: RealtimeService
  ) {}

  async create(dto: CreateDeploymentDto) {
    const deployment = await this.prisma.deployment.create({
      data: {
        projectId: dto.projectId,
        userId: dto.userId,
        buildId: dto.buildId,
        platform: dto.platform,
        config: dto.config,
        status: 'PENDING',
      },
      include: {
        project: {
          include: {
            idea: true,
          },
        },
        user: true,
      },
    });

    // Trigger deployment agent
    this.agentsService.deployProject(deployment).catch((error) => {
      console.error('Deployment error:', error);
      this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });
    });

    await this.realtimeService.emit(
      `deployment:${deployment.id}`,
      'deployment.created',
      deployment
    );

    return deployment;
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.deployment.findMany({
      where,
      include: {
        project: {
          include: {
            idea: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            idea: true,
            user: true,
          },
        },
        user: true,
      },
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment with ID ${id} not found`);
    }

    return deployment;
  }

  /**
   * Rollback deployment to previous version
   */
  async rollback(deploymentId: string): Promise<any> {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { project: true },
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment with ID ${deploymentId} not found`);
    }

    // Find previous successful deployment
    const previous = await this.prisma.deployment.findFirst({
      where: {
        projectId: deployment.projectId,
        status: 'LIVE',
        id: { not: deploymentId },
      },
      orderBy: { deployedAt: 'desc' },
    });

    if (!previous) {
      throw new NotFoundException('No previous deployment to rollback to');
    }

    // Update current deployment status
    await this.prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'ROLLED_BACK' },
    });

    // Restore previous deployment
    await this.prisma.deployment.update({
      where: { id: previous.id },
      data: { status: 'LIVE', deployedAt: new Date() },
    });

    // Emit realtime event
    await this.realtimeService.emit(`deployment:${deploymentId}`, 'deployment.rolled_back', {
      deploymentId,
      previousDeploymentId: previous.id,
    });

    return {
      success: true,
      message: `Rolled back to deployment ${previous.id}`,
      previousDeployment: previous,
    };
  }
}
