import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFeedbackDto {
  type: 'bug' | 'feature' | 'question' | 'other';
  message: string;
  email?: string;
  projectId?: string;
  ideaId?: string;
  userId?: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create feedback
   */
  async create(dto: CreateFeedbackDto) {
    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          type: dto.type,
          message: dto.message,
          email: dto.email,
          projectId: dto.projectId,
          ideaId: dto.ideaId,
          userId: dto.userId,
          status: 'open',
        },
      });

      // Log for monitoring
      this.logger.log(`Feedback received: ${dto.type} from ${dto.email || 'anonymous'}`);

      // TODO: Send notification to team (email, Slack, etc.)

      return feedback;
    } catch (error) {
      this.logger.error('Error creating feedback:', error);
      throw error;
    }
  }

  /**
   * Get all feedback (admin)
   */
  async findAll(status?: string) {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      return await this.prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          idea: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error finding feedback:', error);
      return [];
    }
  }

  /**
   * Update feedback status
   */
  async updateStatus(id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
    try {
      return await this.prisma.feedback.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      this.logger.error('Error updating feedback status:', error);
      throw error;
    }
  }
}

