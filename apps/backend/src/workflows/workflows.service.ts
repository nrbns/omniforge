import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkflowDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} not found`);
    }

    return this.prisma.workflow.create({
      data: {
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        trigger: dto.trigger,
        steps: dto.steps,
      },
    });
  }

  async listForBusiness(businessId: string) {
    return this.prisma.workflow.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }
}
