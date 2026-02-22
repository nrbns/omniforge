import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion,
      });
      this.logger.log('✅ Stripe service initialized');
    } else {
      this.logger.warn('⚠️ Stripe API key not found. Running in test mode.');
    }
  }

  /**
   * Create a checkout session for e-commerce
   */
  async createCheckoutSession(params: {
    lineItems: Array<{ price: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized. Please set STRIPE_SECRET_KEY.');
    }

    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: params.lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
    });
  }

  /**
   * Handle webhook events (payments, subscriptions, etc.)
   */
  async handleWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  }

  /**
   * Create a product
   */
  async createProduct(params: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.products.create({
      name: params.name,
      description: params.description,
      images: params.images,
      metadata: params.metadata,
    });
  }

  /**
   * Create a price for a product
   */
  async createPrice(params: {
    product: string;
    unitAmount: number;
    currency?: string;
    recurring?: { interval: 'month' | 'year' };
  }): Promise<Stripe.Price> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.prices.create({
      product: params.product,
      unit_amount: params.unitAmount,
      currency: params.currency || 'usd',
      recurring: params.recurring,
    });
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}

