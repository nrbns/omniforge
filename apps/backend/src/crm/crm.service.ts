import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCrmDto, CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCrm(dto: CreateCrmDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} not found`);
    }

    return this.prisma.cRM.upsert({
      where: { businessId: dto.businessId },
      create: {
        businessId: dto.businessId,
        config: dto.config,
      },
      update: {
        config: dto.config,
      },
      include: {
        contacts: true,
        companies: true,
        deals: true,
        activities: true,
      },
    });
  }

  async getCrmForBusiness(businessId: string) {
    const crm = await this.prisma.cRM.findUnique({
      where: { businessId },
      include: {
        contacts: true,
        companies: true,
        deals: true,
        activities: true,
      },
    });

    if (!crm) {
      throw new NotFoundException(`CRM for business with ID ${businessId} not found`);
    }

    return crm;
  }

  async createContact(dto: CreateContactDto) {
    const crm = await this.prisma.cRM.findUnique({
      where: { id: dto.crmId },
    });

    if (!crm) {
      throw new NotFoundException(`CRM with ID ${dto.crmId} not found`);
    }

    return this.prisma.contact.create({
      data: {
        crmId: dto.crmId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        company: dto.company,
        title: dto.title,
        tags: dto.tags,
        source: dto.source,
        notes: dto.notes,
      },
    });
  }

  async listContacts(crmId: string) {
    return this.prisma.contact.findMany({
      where: { crmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContact(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async updateContact(id: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: dto,
    });

    return contact;
  }

  async deleteContact(id: string) {
    await this.prisma.contact.delete({
      where: { id },
    });

    return { id };
  }
}
