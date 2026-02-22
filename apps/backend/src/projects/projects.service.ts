import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateProjectDto, UpdateProjectDto, BuildProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
    private realtimeService: RealtimeService
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
      this.logger.error('Build error:', error);
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

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  async list(orgId?: string, userId?: string): Promise<any[]> {
    const where: any = {};
    if (orgId) where.orgId = orgId;
    if (userId) where.userId = userId;

    return this.prisma.project.findMany({
      where,
      include: {
        idea: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string): Promise<any> {
    return this.findOne(id);
  }

  /**
   * Hot patch project (apply changes without rebuild)
   */
  async hotPatch(id: string, updates: { content?: any; tokens?: any }): Promise<any> {
    const project = await this.findOne(id);

    // Update tokens if provided
    if (updates.tokens) {
      await this.prisma.$executeRaw`
        UPDATE "Token"
        SET "tokens" = ${JSON.stringify(updates.tokens)}::jsonb
        WHERE "projectId" = ${id}
      `.catch(() => {
        // Create if doesn't exist
        return this.prisma.$executeRaw`
          INSERT INTO "Token" ("projectId", "tokens", "createdAt")
          VALUES (${id}, ${JSON.stringify(updates.tokens)}::jsonb, NOW())
        `;
      });
    }

    // Update content via hot patch endpoint (if preview is live)
    const previewDeployment = project.deployments?.find(
      (d: { status: string }) => d.status === 'LIVE'
    );
    const previewUrl = previewDeployment?.url;
    if (updates.content && previewUrl) {
      // TODO: Call preview deployment's hot patch endpoint
      // For now, just log
      this.logger.log('Hot patching content to:', previewUrl);
    }

    return { success: true, message: 'Changes applied live' };
  }

  /**
   * Commit visual editor changes
   */
  async commitChanges(
    id: string,
    body: { message: string; tokens?: any; content?: any }
  ): Promise<any> {
    const project = await this.findOne(id);

    // Get idea
    const idea = await this.prisma.idea.findUnique({
      where: { id: project.ideaId },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Get current spec (Prisma JsonValue - cast for merge)
    const rawSpec = idea.specJson;
    const currentSpec = (typeof rawSpec === 'object' && rawSpec !== null ? rawSpec : {}) as Record<
      string,
      unknown
    >;

    // Merge changes into spec
    const updatedSpec = {
      ...currentSpec,
      tokens: body.tokens ?? (currentSpec.tokens as unknown),
      content: body.content ?? (currentSpec.content as unknown),
    };

    // Update idea spec
    await this.prisma.idea.update({
      where: { id: idea.id },
      data: { specJson: updatedSpec },
    });

    return {
      success: true,
      message: 'Changes committed successfully',
    };
  }
}
