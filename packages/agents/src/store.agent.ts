import { LLMService } from '@omniforge/llm';

export interface StoreConfig {
  name: string;
  currency: string;
  taxConfig: any;
  shippingConfig: any;
  paymentConfig: any;
}

export interface Product {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  images: string[];
  variants?: any;
  seo?: any;
}

interface BusinessSpec {
  businessType: string;
  businessModel: string;
  targetAudience: any;
  products?: any[];
  revenueModel?: any;
}

export class StoreAgent {
  constructor(private llmService: LLMService) {}

  /**
   * Generate store configuration
   */
  async generateStore(business: BusinessSpec): Promise<StoreConfig> {
    const prompt = `Design an e-commerce store configuration for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Revenue Model: ${JSON.stringify(business.revenueModel || {})}

Create store configuration:
1. Store name
2. Currency (default: USD)
3. Tax configuration (tax rates, tax-exempt products)
4. Shipping configuration (zones, rates, methods)
5. Payment configuration (gateways: Stripe, PayPal)

Return as JSON:
{
  "name": "...",
  "currency": "USD",
  "taxConfig": {
    "enabled": true,
    "rates": [...]
  },
  "shippingConfig": {
    "zones": [...],
    "methods": [...]
  },
  "paymentConfig": {
    "gateways": ["stripe", "paypal"],
    "default": "stripe"
  }
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: content.name || `${business.businessType} Store`,
      currency: content.currency || 'USD',
      taxConfig: content.taxConfig || { enabled: true },
      shippingConfig: content.shippingConfig || {},
      paymentConfig: content.paymentConfig || {
        gateways: ['stripe'],
        default: 'stripe',
      },
    };
  }

  /**
   * Generate products from catalog
   */
  async generateProducts(business: BusinessSpec, catalog?: any[]): Promise<Product[]> {
    const prompt = `Generate product listings for an e-commerce store for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
${catalog ? `Product Catalog: ${JSON.stringify(catalog)}` : 'Generate 5-10 sample products'}

For each product, generate:
1. Product name
2. Compelling description
3. Price (realistic for business type)
4. Compare price (if on sale)
5. SKU (if applicable)
6. SEO metadata
7. Variants (if applicable: size, color, etc.)

Return as JSON array of products.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 3000,
    });

    const content = this.parseJSONResponse(response);

    return content.products || content || [];
  }

  /**
   * Generate checkout flow
   */
  async generateCheckoutFlow(store: StoreConfig): Promise<any> {
    const prompt = `Design a checkout flow for an e-commerce store.

Store Config: ${JSON.stringify(store)}

Create checkout flow with:
1. Cart page
2. Checkout steps (shipping, payment, review)
3. Order confirmation
4. Email notifications
5. Error handling

Return as JSON:
{
  "steps": [
    {"name": "...", "fields": [...], "validation": {...}}
  ],
  "paymentMethods": [...],
  "shippingOptions": [...]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    return this.parseJSONResponse(response);
  }

  /**
   * Generate payment integration
   */
  async generatePaymentIntegration(store: StoreConfig): Promise<any> {
    const prompt = `Design payment integration for an e-commerce store.

Store Config: ${JSON.stringify(store)}
Payment Gateways: ${store.paymentConfig?.gateways?.join(', ') || 'stripe'}

Create payment integration configuration:
1. Gateway setup
2. Payment methods (card, PayPal, etc.)
3. Security measures
4. Webhook handlers
5. Error handling

Return as JSON configuration.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    return this.parseJSONResponse(response);
  }

  /**
   * Generate inventory system
   */
  async generateInventorySystem(store: StoreConfig): Promise<any> {
    const prompt = `Design an inventory management system for an e-commerce store.

Store Config: ${JSON.stringify(store)}

Create inventory system with:
1. Stock tracking
2. Low stock alerts
3. Out of stock handling
4. Variant inventory
5. Inventory reports

Return as JSON:
{
  "tracking": true,
  "lowStockThreshold": 10,
  "alerts": [...],
  "features": [...]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    return this.parseJSONResponse(response);
  }

  /**
   * Parse JSON response from LLM
   */
  private parseJSONResponse(response: string): any {
    try {
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(response);
    } catch (error) {
      return { content: response };
    }
  }
}

