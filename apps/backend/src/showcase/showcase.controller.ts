import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShowcaseService } from './showcase.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('showcase')
@Controller('showcase')
@Public() // Public endpoint - no auth required
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all showcase apps' })
  @ApiResponse({ status: 200, description: 'List of showcase apps' })
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.showcaseService.findAll(category, search);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured showcase apps' })
  @ApiResponse({ status: 200, description: 'List of featured apps' })
  async findFeatured(@Query('limit') limit?: string) {
    return this.showcaseService.findFeatured(parseInt(limit || '6', 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get showcase app by ID' })
  @ApiResponse({ status: 200, description: 'Showcase app details' })
  async findOne(@Param('id') id: string) {
    return this.showcaseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit app to showcase' })
  @ApiResponse({ status: 201, description: 'App submitted successfully' })
  async create(@Body() dto: any) {
    return this.showcaseService.create(dto);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote for a showcase app' })
  @ApiResponse({ status: 200, description: 'Vote recorded' })
  async vote(@Param('id') id: string, @Body() body?: { userId?: string }) {
    return this.showcaseService.vote(id, body?.userId);
  }
}

