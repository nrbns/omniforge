import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto, UpdateTokenDto } from './dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    return this.tokensService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tokensService.findOne(id);
  }

  @Post()
  async create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(id, updateTokenDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tokensService.remove(id);
  }

  @Get('export/json')
  async exportJson(@Query('projectId') projectId?: string) {
    return this.tokensService.exportJson(projectId);
  }

  @Post('import/json')
  async importJson(@Body() data: { tokens: any[]; projectId?: string }) {
    return this.tokensService.importJson(data.tokens, data.projectId);
  }
}

