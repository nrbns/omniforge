/**
 * E-Comm Agent - Generates e-commerce stores with Stripe/PayPal integration
 * Beats Shopify/Lovable by being AI-orchestrated and code-exportable
 */

import { LLMService } from '@omniforge/llm';

interface ECommSpec {
  title: string;
  description: string;
  products?: Array<{
    name: string;
    price: number;
    description?: string;
    image?: string;
  }>;
  paymentMethods?: ('stripe' | 'paypal')[];
  shipping?: {
    enabled: boolean;
    regions?: string[];
  };
  audience?: string;
}

interface ECommOutput {
  frontend: {
    code: string;
    components: string[];
    pages: string[];
  };
  backend: {
    api: string;
    schema: string;
    webhooks: string[];
  };
  integrations: {
    stripe?: { key: string; webhookSecret: string };
    paypal?: { clientId: string; secret: string };
  };
  crm?: {
    leadForm: string;
    emailSequence: string[];
  };
}

export class ECommAgent {
  constructor(private llmService: LLMService) {}

  async generate(spec: ECommSpec): Promise<ECommOutput> {
    // Generate Next.js e-commerce store
    const storePrompt = `Generate a complete Next.js e-commerce store for "${spec.title}".

Requirements:
- Product catalog with images, prices, descriptions
- Shopping cart functionality
- Checkout flow with ${spec.paymentMethods?.join(' and ') || 'Stripe'} integration
- Product search and filtering
- SEO-optimized pages with meta tags
- Responsive design with Tailwind CSS
- TypeScript with full type safety

Products: ${JSON.stringify(spec.products || [])}
Shipping: ${spec.shipping?.enabled ? `Enabled for ${spec.shipping.regions?.join(', ') || 'all regions'}` : 'Disabled'}

Output complete, production-ready code with:
1. Product listing page (/products)
2. Product detail page (/products/[id])
3. Cart page (/cart)
4. Checkout page (/checkout)
5. API routes for cart, checkout, webhooks
6. Prisma schema for products, orders, cart items
7. Stripe/PayPal integration code`;

    const frontendCode = await this.llmService.generate(storePrompt);

    // Generate backend API and schema
    const backendPrompt = `Generate NestJS backend for e-commerce store "${spec.title}".

Requirements:
- REST API endpoints for products, cart, orders
- Prisma schema with Product, Order, OrderItem, Cart models
- Stripe webhook handler for payment events
- Order management and inventory tracking
- TypeScript DTOs and validation

Output:
1. Complete Prisma schema
2. Controller endpoints
3. Service layer with business logic
4. DTOs for requests/responses
5. Webhook handlers`;

    const backendCode = await this.llmService.generate(backendPrompt);

    // Generate CRM integration (HubSpot-like lead form + email sequence)
    const crmPrompt = `Generate CRM integration for "${spec.title}" targeting "${spec.audience || 'general audience'}".

Requirements:
- Lead capture form (React component with validation)
- Email welcome sequence (MJML templates)
- A/B testing setup for email campaigns
- Lead scoring logic
- Integration with Supabase for contact storage

Output:
1. Lead form component (React + TypeScript)
2. Email templates (MJML format):
   - Welcome email
   - Abandoned cart reminder
   - Order confirmation
3. Supabase schema for contacts/leads
4. Email service integration code`;

    const crmCode = await this.llmService.generate(crmPrompt);

    // Parse outputs (in production, use structured output or parsing)
    return {
      frontend: {
        code: frontendCode,
        components: this.extractComponents(frontendCode),
        pages: this.extractPages(frontendCode),
      },
      backend: {
        api: backendCode,
        schema: this.extractSchema(backendCode),
        webhooks: ['stripe', 'paypal'],
      },
      integrations: {
        stripe: {
          key: 'env:STRIPE_SECRET_KEY',
          webhookSecret: 'env:STRIPE_WEBHOOK_SECRET',
        },
        paypal: spec.paymentMethods?.includes('paypal')
          ? {
              clientId: 'env:PAYPAL_CLIENT_ID',
              secret: 'env:PAYPAL_SECRET',
            }
          : undefined,
      },
      crm: {
        leadForm: this.extractLeadForm(crmCode),
        emailSequence: this.extractEmailSequence(crmCode),
      },
    };
  }

  private extractComponents(code: string): string[] {
    // Simple extraction - in production, use AST parsing
    const componentMatches = code.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/g);
    return componentMatches?.map((m) => m.replace(/export\s+(?:default\s+)?(?:function|const)\s+/, '')) || [];
  }

  private extractPages(code: string): string[] {
    const pageMatches = code.match(/\/\/\s*Page:\s*([^\n]+)/g);
    return pageMatches?.map((m) => m.replace(/\/\/\s*Page:\s*/, '')) || ['/products', '/cart', '/checkout'];
  }

  private extractSchema(code: string): string {
    const schemaMatch = code.match(/model\s+\w+\s*\{[\s\S]*?\n\}/g);
    return schemaMatch?.join('\n\n') || code;
  }

  private extractLeadForm(code: string): string {
    const formMatch = code.match(/<form[\s\S]*?<\/form>/);
    return formMatch?.[0] || code;
  }

  private extractEmailSequence(code: string): string[] {
    const emailMatches = code.match(/<!--\s*Email:\s*([^\n]+)[\s\S]*?<\/mjml>/g);
    return emailMatches || [];
  }
}

