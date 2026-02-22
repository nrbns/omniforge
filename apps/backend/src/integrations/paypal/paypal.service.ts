import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private readonly baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    this.baseUrl =
      this.configService.get<string>('PAYPAL_ENV') === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('⚠️ PayPal credentials not found. Running in test mode.');
    } else {
      this.logger.log('✅ PayPal service initialized');
    }
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        },
      );

      const token = response.data.access_token;
      this.accessToken = token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      if (!token) throw new Error('No access token in PayPal response');
      return token;
    } catch (error) {
      this.logger.error('Failed to get PayPal access token:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  /**
   * Create PayPal order
   */
  async createOrder(params: {
    amount: number;
    currency?: string;
    description?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<any> {
    if (!this.clientId || !this.clientSecret) {
      // Return mock order for testing
      return {
        id: `mock_order_${Date.now()}`,
        status: 'CREATED',
        links: [
          {
            href: params.returnUrl,
            rel: 'approve',
            method: 'GET',
          },
        ],
      };
    }

    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: params.currency || 'USD',
                value: params.amount.toFixed(2),
              },
              description: params.description,
            },
          ],
          application_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to create PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  /**
   * Capture PayPal order
   */
  async captureOrder(orderId: string): Promise<any> {
    if (!this.clientId || !this.clientSecret) {
      return {
        id: `mock_capture_${Date.now()}`,
        status: 'COMPLETED',
        amount: { currency_code: 'USD', value: '0.00' },
      };
    }

    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to capture PayPal order:', error);
      throw new Error('Failed to capture PayPal order');
    }
  }

  /**
   * Handle PayPal webhook
   */
  async verifyWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    // TODO: Implement PayPal webhook verification
    // For now, return true (in production, verify signature)
    return true;
  }
}

