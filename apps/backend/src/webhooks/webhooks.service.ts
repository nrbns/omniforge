import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create webhook endpoint
   */
  async createWebhook(params: {
    businessId: string;
    url: string;
    events: string[];
    secret?: string;
  }): Promise<any> {
    // TODO: Store webhook in database
    const webhookId = `wh_${Date.now()}`;
    this.logger.log(`Created webhook ${webhookId} for business ${params.businessId}`);

    return {
      id: webhookId,
      url: params.url,
      events: params.events,
      secret: params.secret || this.generateSecret(),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(webhookId: string, event: string, payload: any): Promise<void> {
    // TODO: Get webhook from database
    const webhook = {
      id: webhookId,
      url: 'https://example.com/webhook',
      secret: 'secret',
    };

    try {
      const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);

      await axios.post(webhook.url, payload, {
        headers: {
          'X-Webhook-Event': event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Id': webhookId,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      this.logger.log(`Webhook ${webhookId} triggered successfully`);
    } catch (error) {
      this.logger.error(`Failed to trigger webhook ${webhookId}:`, error);
      throw new Error('Failed to trigger webhook');
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }
}

