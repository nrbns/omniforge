import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CreateCrmDto, CreateContactDto, UpdateContactDto } from './dto';

@ApiTags('crm')
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  @ApiOperation({
    summary: 'Create or update CRM for a business',
  })
  @ApiBody({ type: CreateCrmDto })
  @ApiResponse({ status: 200, description: 'CRM upserted successfully' })
  async upsertCrm(@Body() dto: CreateCrmDto) {
    return this.crmService.upsertCrm(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Get CRM for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'CRM details' })
  async getCrmForBusiness(@Param('businessId') businessId: string) {
    return this.crmService.getCrmForBusiness(businessId);
  }

  @Post('contacts')
  @ApiOperation({
    summary: 'Create a contact in the CRM',
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contact created' })
  async createContact(@Body() dto: CreateContactDto) {
    return this.crmService.createContact(dto);
  }

  @Get('contacts/crm/:crmId')
  @ApiOperation({
    summary: 'List contacts for a CRM',
  })
  @ApiParam({ name: 'crmId', description: 'CRM ID' })
  @ApiResponse({ status: 200, description: 'List of contacts' })
  async listContacts(@Param('crmId') crmId: string) {
    return this.crmService.listContacts(crmId);
  }

  @Get('contacts/:id')
  @ApiOperation({
    summary: 'Get a contact by ID',
  })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact details' })
  async getContact(@Param('id') id: string) {
    return this.crmService.getContact(id);
  }

  @Put('contacts/:id')
  @ApiOperation({
    summary: 'Update a contact',
  })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({ status: 200, description: 'Contact updated' })
  async updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.crmService.updateContact(id, dto);
  }

  @Delete('contacts/:id')
  @ApiOperation({
    summary: 'Delete a contact',
  })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact deleted' })
  async deleteContact(@Param('id') id: string) {
    return this.crmService.deleteContact(id);
  }
}
