import { Test, TestingModule } from '@nestjs/testing';
import { IdeasController } from '../ideas/ideas.controller';
import { IdeasService } from '../ideas/ideas.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AgentsService } from '../agents/agents.service';

describe('IdeasController', () => {
  let controller: IdeasController;
  let service: IdeasService;

  const mockPrismaService = {
    idea: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRealtimeService = {
    emit: jest.fn(),
  };

  const mockAgentsService = {
    parseIdea: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdeasController],
      providers: [
        IdeasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeService, useValue: mockRealtimeService },
        { provide: AgentsService, useValue: mockAgentsService },
      ],
    }).compile();

    controller = module.get<IdeasController>(IdeasController);
    service = module.get<IdeasService>(IdeasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an idea', async () => {
      const createDto = {
        userId: 'user123',
        title: 'Test Idea',
        description: 'Test description',
      };

      const expectedIdea = {
        id: 'idea123',
        ...createDto,
        status: 'DRAFT',
        createdAt: new Date(),
      };

      mockPrismaService.idea.create.mockResolvedValue(expectedIdea);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedIdea);
      expect(mockPrismaService.idea.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: createDto.userId,
          title: createDto.title,
          status: 'DRAFT',
        }),
        include: { user: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of ideas', async () => {
      const expectedIdeas = [
        { id: 'idea1', title: 'Idea 1', userId: 'user1' },
        { id: 'idea2', title: 'Idea 2', userId: 'user1' },
      ];

      mockPrismaService.idea.findMany.mockResolvedValue(expectedIdeas);

      const result = await controller.findAll();

      expect(result).toEqual(expectedIdeas);
      expect(mockPrismaService.idea.findMany).toHaveBeenCalled();
    });
  });
});

