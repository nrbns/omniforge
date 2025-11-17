import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateShowcaseAppDto {
  title: string;
  description: string;
  category: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  screenshot?: string;
  authorId?: string;
}

@Injectable()
export class ShowcaseService {
  private readonly logger = new Logger(ShowcaseService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all showcase apps (public)
   */
  async findAll(category?: string, search?: string) {
    const where: any = {
      published: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    try {
      return await this.prisma.showcaseApp.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { votes: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    } catch (error) {
      // If table doesn't exist yet, return empty array
      this.logger.warn('ShowcaseApp table may not exist yet:', error);
      return [];
    }
  }

  /**
   * Get featured apps
   */
  async findFeatured(limit: number = 6) {
    try {
      return await this.prisma.showcaseApp.findMany({
        where: {
          published: true,
          featured: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { votes: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.warn('ShowcaseApp table may not exist yet:', error);
      return [];
    }
  }

  /**
   * Submit new app to showcase
   */
  async create(dto: CreateShowcaseAppDto) {
    try {
      // For now, auto-publish (can add moderation later)
      return await this.prisma.showcaseApp.create({
        data: {
          title: dto.title,
          description: dto.description,
          category: dto.category,
          tags: dto.tags,
          liveUrl: dto.liveUrl,
          githubUrl: dto.githubUrl,
          screenshot: dto.screenshot,
          authorId: dto.authorId || undefined,
          published: true, // Auto-publish for now
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error creating showcase app:', error);
      throw error;
    }
  }

  /**
   * Vote for an app
   */
  async vote(appId: string, userId?: string) {
    try {
      // Check if user already voted (if authenticated)
      if (userId) {
        const existingVote = await this.prisma.showcaseVote.findUnique({
          where: {
            appId_userId: {
              appId,
              userId,
            },
          },
        });

        if (existingVote) {
          throw new Error('Already voted');
        }

        // Create vote record
        await this.prisma.showcaseVote.create({
          data: {
            appId,
            userId,
          },
        });
      }

      // Increment vote count
      return await this.prisma.showcaseApp.update({
        where: { id: appId },
        data: {
          votes: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      this.logger.error('Error voting for showcase app:', error);
      throw error;
    }
  }

  /**
   * Get app by ID
   */
  async findOne(id: string) {
    try {
      return await this.prisma.showcaseApp.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error finding showcase app:', error);
      return null;
    }
  }
}

