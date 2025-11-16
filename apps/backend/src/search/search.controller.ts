import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string, @Query('limit') limit: string = '10') {
    return this.searchService.hybridSearch(query, parseInt(limit));
  }

  @Get('semantic')
  async semanticSearch(@Query('q') query: string, @Query('limit') limit: string = '10') {
    return this.searchService.semanticSearch(query, parseInt(limit));
  }

  @Get('rag')
  async ragSearch(@Query('q') query: string) {
    return this.searchService.ragSearch(query);
  }
}
