import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFunnelDto } from './dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFunnel(dto: CreateFunnelDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} not found`);
    }

    return this.prisma.salesFunnel.create({
      data: {
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        stages: dto.stages,
      },
    });
  }

  async listFunnels(businessId: string) {
    return this.prisma.salesFunnel.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFunnel(id: string) {
    const funnel = await this.prisma.salesFunnel.findUnique({
      where: { id },
      include: {
        leads: true,
      },
    });

    if (!funnel) {
      throw new NotFoundException(`Sales funnel with ID ${id} not found`);
    }

    return funnel;
  }
}
