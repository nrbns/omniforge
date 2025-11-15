import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { KnowledgeBaseService } from '@omniforge/knowledge-base';
import { TemplateRetrievalService } from '@omniforge/knowledge-base';
import { KnowledgeEntry } from '@omniforge/knowledge-base';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(
    private readonly knowledgeBase: KnowledgeBaseService,
    private readonly templateRetrieval: TemplateRetrievalService,
  ) {}

  @Get()
  async search(@Query('query') query: string, @Query('category') category?: string) {
    return this.knowledgeBase.search(query, category);
  }

  @Post()
  async addEntry(@Body() entry: KnowledgeEntry) {
    await this.knowledgeBase.addEntry(entry);
    return { success: true, id: entry.id };
  }

  @Get('templates')
  async findTemplates(
    @Query('idea') idea: string,
    @Query('limit') limit: string = '5',
  ) {
    return this.templateRetrieval.findTemplates(idea, parseInt(limit));
  }

  @Get('templates/best')
  async getBestTemplate(@Query('idea') idea: string) {
    return this.templateRetrieval.getBestTemplate(idea);
  }
}

