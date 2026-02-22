import { Controller, Post, Body, Headers, Param, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PayPalService } from './paypal.service';

@ApiTags('integrations')
@Controller('integrations/paypal')
export class PayPalController {
  private readonly logger = new Logger(PayPalController.name);

  constructor(private readonly paypalService: PayPalService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create PayPal order' })
  @ApiResponse({ status: 200, description: 'Order created' })
  async createOrder(
    @Body()
    body: {
      amount: number;
      currency?: string;
      description?: string;
      returnUrl: string;
      cancelUrl: string;
    }
  ) {
    const order = await this.paypalService.createOrder(body);
    return {
      orderId: order.id,
      approvalUrl: order.links?.find((l: any) => l.rel === 'approve')?.href,
    };
  }

  @Post('orders/:orderId/capture')
  @ApiOperation({ summary: 'Capture PayPal order' })
  @ApiResponse({ status: 200, description: 'Order captured' })
  async captureOrder(@Param('orderId') orderId: string) {
    return this.paypalService.captureOrder(orderId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle PayPal webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Headers() headers: Record<string, string>, @Body() body: any) {
    const verified = await this.paypalService.verifyWebhook(headers, body);
    if (!verified) {
      throw new Error('Invalid webhook signature');
    }

    // Handle different event types
    switch (body.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        this.logger.log('Payment captured:', body.resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle failed payment
        this.logger.warn('Payment denied:', body.resource);
        break;
      default:
        this.logger.log(`Unhandled PayPal event: ${body.event_type}`);
    }

    return { received: true };
  }
}
