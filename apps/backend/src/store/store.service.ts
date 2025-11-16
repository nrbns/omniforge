import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertStoreDto, CreateProductDto } from './dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertStore(dto: UpsertStoreDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} not found`);
    }

    return this.prisma.store.upsert({
      where: { businessId: dto.businessId },
      create: {
        businessId: dto.businessId,
        name: dto.name,
        domain: dto.domain,
        currency: dto.currency ?? 'USD',
        taxConfig: dto.taxConfig,
        shippingConfig: dto.shippingConfig,
        paymentConfig: dto.paymentConfig,
      },
      update: {
        name: dto.name,
        domain: dto.domain,
        currency: dto.currency ?? 'USD',
        taxConfig: dto.taxConfig,
        shippingConfig: dto.shippingConfig,
        paymentConfig: dto.paymentConfig,
      },
      include: {
        products: true,
        orders: true,
        coupons: true,
      },
    });
  }

  async getStoreForBusiness(businessId: string) {
    const store = await this.prisma.store.findUnique({
      where: { businessId },
      include: {
        products: true,
        orders: true,
        coupons: true,
      },
    });

    if (!store) {
      throw new NotFoundException(`Store for business with ID ${businessId} not found`);
    }

    return store;
  }

  async createProduct(dto: CreateProductDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${dto.storeId} not found`);
    }

    return this.prisma.product.create({
      data: {
        storeId: dto.storeId,
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        price: dto.price,
        comparePrice: dto.comparePrice,
        inventory: dto.inventory ?? null,
        images: dto.images ?? [],
        variants: dto.variants,
        seo: dto.seo,
      },
    });
  }

  async listProducts(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listOrders(storeId: string) {
    return this.prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
