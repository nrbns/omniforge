import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : { projectId: null };
    return this.prisma.designToken.findMany({
      where,
      orderBy: {
        category: 'asc',
        key: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const token = await this.prisma.designToken.findUnique({
      where: { id },
    });

    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    return token;
  }

  async create(dto: any) {
    return this.prisma.designToken.create({
      data: {
        projectId: dto.projectId || null,
        key: dto.key,
        value: dto.value,
        category: dto.category,
        figmaId: dto.figmaId,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.designToken.update({
      where: { id },
      data: {
        value: dto.value,
        figmaId: dto.figmaId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.designToken.delete({
      where: { id },
    });
  }

  async exportJson(projectId?: string) {
    const tokens = await this.findAll(projectId);
    const grouped: Record<string, Record<string, string>> = {};

    tokens.forEach((token) => {
      if (!grouped[token.category]) {
        grouped[token.category] = {};
      }
      grouped[token.category][token.key] = token.value;
    });

    return grouped;
  }

  async importJson(tokens: any[], projectId?: string) {
    const results = [];

    for (const token of tokens) {
      // Handle nullable projectId for unique constraint
      // Prisma requires explicit type handling for nullable fields in unique constraints
      const whereClause = projectId
        ? { projectId_key: { projectId, key: token.key } }
        : { projectId_key: { projectId: null, key: token.key } };

      const result = await this.prisma.designToken.upsert({
        where: whereClause as any, // Type assertion needed for nullable unique constraint
        update: {
          value: token.value,
          category: token.category,
        },
        create: {
          projectId: projectId || null,
          key: token.key,
          value: token.value,
          category: token.category,
        },
      });
      results.push(result);
    }

    return results;
  }
}
