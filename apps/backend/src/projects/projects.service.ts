import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateProjectDto, UpdateProjectDto, BuildProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
    private realtimeService: RealtimeService,
  ) {}

  async create(dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        ideaId: dto.ideaId,
        userId: dto.userId,
        name: dto.name,
        description: dto.description,
        config: dto.config,
        status: 'DRAFT',
      },
      include: {
        idea: true,
        user: true,
      },
    });

    await this.realtimeService.emit(`project:${project.id}`, 'project.created', project);

    return project;
  }

  async findAll(userId?: string, ideaId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (ideaId) where.ideaId = ideaId;

    return this.prisma.project.findMany({
      where,
      include: {
        idea: true,
        user: true,
        _count: {
          select: {
            builds: true,
            deployments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        idea: true,
        user: true,
        builds: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        deployments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: { id },
      data: dto,
      include: {
        idea: true,
        user: true,
      },
    });

    await this.realtimeService.emit(`project:${id}`, 'project.updated', project);

    return project;
  }

  async build(id: string, dto: BuildProjectDto) {
    const project = await this.findOne(id);

    // Create build record
    const build = await this.prisma.build.create({
      data: {
        projectId: id,
        status: 'QUEUED',
      },
    });

    // Trigger build agents
    this.agentsService.buildProject(project, build.id).catch((error) => {
      console.error('Build error:', error);
      this.prisma.build.update({
        where: { id: build.id },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date(),
        },
      });
    });

    await this.realtimeService.emit(`build:${build.id}`, 'build.created', build);

    return build;
  }
}

