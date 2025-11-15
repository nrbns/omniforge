import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { ScaffoldService } from '../scaffold/scaffold.service';

@Injectable()
export class BuildsService {
  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
    private scaffoldService: ScaffoldService,
  ) {}

  async create(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { idea: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const build = await this.prisma.build.create({
      data: {
        projectId,
        status: 'QUEUED',
      },
    });

    return build;
  }

  async startBuild(buildId: string, projectId: string) {
    const build = await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { idea: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Trigger build agents
    this.agentsService.buildProject(project, buildId).catch(async (error) => {
      await this.prisma.build.update({
        where: { id: buildId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date(),
        },
      });
    });

    return build;
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.build.findMany({
      where,
      include: {
        project: {
          include: {
            idea: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const build = await this.prisma.build.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            idea: true,
            user: true,
          },
        },
      },
    });

    if (!build) {
      throw new NotFoundException(`Build with ID ${id} not found`);
    }

    return build;
  }

  async getLogs(id: string) {
    const build = await this.findOne(id);
    return {
      id: build.id,
      logs: build.logs || '',
      status: build.status,
    };
  }
}

