import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto, CommitIdeaDto, BranchIdeaDto } from './dto';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  async create(@Body() createIdeaDto: CreateIdeaDto) {
    return this.ideasService.create(createIdeaDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.ideasService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Get(':id/spec')
  async getSpec(@Param('id') id: string) {
    return this.ideasService.getSpec(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return this.ideasService.update(id, updateIdeaDto);
  }

  @Post(':id/commit')
  async commit(@Param('id') id: string, @Body() commitDto: CommitIdeaDto) {
    return this.ideasService.commit(id, commitDto);
  }

  @Post(':id/branch')
  async branch(@Param('id') id: string, @Body() branchDto: BranchIdeaDto) {
    return this.ideasService.branch(id, branchDto);
  }

  @Post(':id/parse')
  async parseIdea(@Param('id') id: string) {
    return this.ideasService.parseIdea(id);
  }
}

