import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto, CommitIdeaDto, BranchIdeaDto } from './dto';

@ApiTags('ideas')
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new idea' })
  @ApiBody({ type: CreateIdeaDto })
  @ApiResponse({ status: 201, description: 'Idea created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createIdeaDto: CreateIdeaDto) {
    return this.ideasService.create(createIdeaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ideas' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'List of ideas' })
  async findAll(@Query('userId') userId?: string) {
    return this.ideasService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get idea by ID' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiResponse({ status: 200, description: 'Idea details' })
  @ApiResponse({ status: 404, description: 'Idea not found' })
  async findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Get(':id/spec')
  @ApiOperation({ summary: 'Get parsed specification for an idea' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiResponse({ status: 200, description: 'Parsed specification' })
  async getSpec(@Param('id') id: string) {
    return this.ideasService.getSpec(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an idea' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiBody({ type: UpdateIdeaDto })
  @ApiResponse({ status: 200, description: 'Idea updated' })
  async update(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return this.ideasService.update(id, updateIdeaDto);
  }

  @Post(':id/commit')
  @ApiOperation({ summary: 'Create a commit for an idea' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiBody({ type: CommitIdeaDto })
  @ApiResponse({ status: 201, description: 'Commit created' })
  async commit(@Param('id') id: string, @Body() commitDto: CommitIdeaDto) {
    return this.ideasService.commit(id, commitDto);
  }

  @Post(':id/branch')
  @ApiOperation({ summary: 'Create a branch from an idea' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiBody({ type: BranchIdeaDto })
  @ApiResponse({ status: 201, description: 'Branch created' })
  async branch(@Param('id') id: string, @Body() branchDto: BranchIdeaDto) {
    return this.ideasService.branch(id, branchDto);
  }

  @Post(':id/parse')
  @ApiOperation({ summary: 'Parse an idea into a specification using AI' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiResponse({ status: 200, description: 'Idea parsed successfully' })
  @ApiResponse({ status: 400, description: 'Idea is not in a parseable state' })
  async parseIdea(@Param('id') id: string) {
    return this.ideasService.parseIdea(id);
  }

  @Post(':id/ai-stream')
  @ApiOperation({ summary: 'Stream AI-generated improvements to idea description' })
  @ApiParam({ name: 'id', description: 'Idea ID' })
  @ApiResponse({ status: 200, description: 'AI streaming started' })
  async streamAIImprovements(@Param('id') id: string, @Body() body: { prompt?: string }) {
    return this.ideasService.streamAIImprovements(id, body.prompt);
  }
}
