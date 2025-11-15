import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuildsService {
  constructor(private prisma: PrismaService) {}

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

