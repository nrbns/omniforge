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
    private realtimeService: RealtimeService,
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
      deployment,
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
}

