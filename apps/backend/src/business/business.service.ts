import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService
  ) {}

  async upsertForProject(projectId: string, dto: CreateBusinessDto) {
    // Ensure project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { idea: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const business = await this.prisma.business.upsert({
      where: { projectId },
      create: {
        projectId,
        businessType: dto.businessType,
        businessModel: dto.businessModel,
        targetAudience: dto.targetAudience,
        revenueModel: dto.revenueModel,
        competitiveAnalysis: dto.competitiveAnalysis,
        marketingStrategy: dto.marketingStrategy,
      },
      update: {
        businessType: dto.businessType,
        businessModel: dto.businessModel,
        targetAudience: dto.targetAudience,
        revenueModel: dto.revenueModel,
        competitiveAnalysis: dto.competitiveAnalysis,
        marketingStrategy: dto.marketingStrategy,
      },
      include: {
        project: true,
        marketingAssets: true,
        salesFunnels: true,
        crm: true,
        store: true,
        workflows: true,
      },
    });

    await this.realtimeService.emit(`business:${business.id}`, 'business.updated', business);

    return business;
  }

  async findByProject(projectId: string) {
    const business = await this.prisma.business.findUnique({
      where: { projectId },
      include: {
        project: true,
        marketingAssets: true,
        salesFunnels: true,
        crm: true,
        store: true,
        workflows: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business for project with ID ${projectId} not found`);
    }

    return business;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.update({
      where: { id },
      data: dto,
      include: {
        project: true,
        marketingAssets: true,
        salesFunnels: true,
        crm: true,
        store: true,
        workflows: true,
      },
    });

    await this.realtimeService.emit(`business:${business.id}`, 'business.updated', business);

    return business;
  }
}
