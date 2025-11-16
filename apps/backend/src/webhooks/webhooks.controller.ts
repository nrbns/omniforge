import { Controller, Post, Get, Body, Param, Headers, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook created' })
  async createWebhook(@Body() body: {
    businessId: string;
    url: string;
    events: string[];
    secret?: string;
  }) {
    return this.webhooksService.createWebhook(body);
  }

  @Post(':webhookId/trigger')
  @ApiOperation({ summary: 'Trigger webhook' })
  @ApiResponse({ status: 200, description: 'Webhook triggered' })
  async triggerWebhook(
    @Param('webhookId') webhookId: string,
    @Body() body: { event: string; payload: any },
  ) {
    await this.webhooksService.triggerWebhook(webhookId, body.event, body.payload);
    return { success: true };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify webhook signature' })
  @ApiResponse({ status: 200, description: 'Signature verified' })
  async verifyWebhook(
    @Headers('x-webhook-signature') signature: string,
    @Body() body: any,
    @Body('secret') secret: string,
  ) {
    const payload = JSON.stringify(body);
    const verified = this.webhooksService.verifySignature(payload, signature, secret);
    return { verified };
  }
}

