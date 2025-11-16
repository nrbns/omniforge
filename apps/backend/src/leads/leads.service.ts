import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        funnelId: dto.funnelId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        source: dto.source,
        metadata: dto.metadata,
      },
    });
  }

  async listForBusiness(businessId: string) {
    // Leads are linked to funnels, which are linked to business
    return this.prisma.lead.findMany({
      where: {
        funnel: {
          businessId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForFunnel(funnelId: string) {
    return this.prisma.lead.findMany({
      where: { funnelId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
    });
  }
}
