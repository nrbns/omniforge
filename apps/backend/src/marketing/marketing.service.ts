import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketingAssetDto } from './dto';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMarketingAssetDto) {
    // Ensure business exists
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} not found`);
    }

    return this.prisma.marketingAsset.create({
      data: {
        businessId: dto.businessId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        platform: dto.platform,
      },
    });
  }

  async findByBusiness(businessId: string) {
    return this.prisma.marketingAsset.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
