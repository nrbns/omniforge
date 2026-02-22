import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import Stripe from 'stripe';

@ApiTags('integrations')
@Controller('integrations/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    @Body() body: any
  ) {
    // In production, use raw body for webhook signature verification
    // For now, use JSON body (Stripe webhooks should use raw body in production)
    const payload = JSON.stringify(body);
    const event = await this.stripeService.handleWebhook(payload, signature || '');

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        // eslint-disable-next-line no-console
        console.log('Payment succeeded:', event.data.object);
        // TODO: Update order status in database
        break;

      case 'payment_intent.payment_failed':
        // Handle failed payment
        // eslint-disable-next-line no-console
        console.log('Payment failed:', event.data.object);
        // TODO: Notify user, update order status
        break;

      case 'checkout.session.completed':
        // Handle completed checkout
        // eslint-disable-next-line no-console
        console.log('Checkout completed:', event.data.object);
        // TODO: Create order, send confirmation email
        break;

      default:
        // eslint-disable-next-line no-console
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created' })
  async createCheckout(
    @Body()
    body: {
      lineItems: Array<{ price: string; quantity: number }>;
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    }
  ) {
    const session = await this.stripeService.createCheckoutSession(body);
    return { sessionId: session.id, url: session.url };
  }
}
