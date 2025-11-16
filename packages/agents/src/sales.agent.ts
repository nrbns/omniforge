import { LLMService } from '@omniforge/llm';

export interface SalesFunnel {
  name: string;
  description: string;
  stages: FunnelStage[];
}

export interface FunnelStage {
  name: string;
  type: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention';
  conversionGoal: string;
  pageType: string;
  content: any;
}

export interface LeadMagnet {
  type: 'pdf' | 'ebook' | 'checklist' | 'template' | 'webinar' | 'course';
  title: string;
  description: string;
  content: any;
}

interface BusinessSpec {
  businessType: string;
  businessModel: string;
  targetAudience: any;
  revenueModel: any;
  products?: any[];
}

export class SalesAgent {
  constructor(private llmService: LLMService) {}

  /**
   * Generate sales funnel
   */
  async generateSalesFunnel(business: BusinessSpec): Promise<SalesFunnel> {
    const prompt = `Design a complete sales funnel for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Revenue Model: ${JSON.stringify(business.revenueModel)}

Create a funnel with these stages:
1. Awareness (Top of funnel - landing page)
2. Interest (Middle of funnel - lead magnet)
3. Consideration (Middle of funnel - nurture sequence)
4. Purchase (Bottom of funnel - sales page)
5. Retention (Post-purchase - onboarding/upsell)

For each stage, specify:
- Stage name
- Type (awareness, interest, consideration, purchase, retention)
- Conversion goal
- Page type needed
- Key content elements

Return as JSON:
{
  "name": "...",
  "description": "...",
  "stages": [
    {
      "name": "...",
      "type": "...",
      "conversionGoal": "...",
      "pageType": "...",
      "content": {...}
    }
  ]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: content.name || `${business.businessType} Sales Funnel`,
      description: content.description || 'Complete sales funnel',
      stages: content.stages || [],
    };
  }

  /**
   * Generate lead magnet
   */
  async generateLeadMagnet(
    business: BusinessSpec,
    type: 'pdf' | 'ebook' | 'checklist' | 'template' | 'webinar' | 'course'
  ): Promise<LeadMagnet> {
    const typeDescriptions = {
      pdf: 'A downloadable PDF guide or resource',
      ebook: 'A comprehensive ebook',
      checklist: 'A practical checklist',
      template: 'A ready-to-use template',
      webinar: 'A webinar registration offer',
      course: 'A mini-course or training',
    };

    const prompt = `Create a ${type} lead magnet for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Type: ${typeDescriptions[type]}

Generate:
1. Compelling title
2. Description (what they'll get)
3. Value proposition
4. Content outline (if applicable)
5. Landing page copy for the lead magnet

Return as JSON:
{
  "title": "...",
  "description": "...",
  "valueProposition": "...",
  "contentOutline": [...],
  "landingPageCopy": {
    "headline": "...",
    "subheadline": "...",
    "benefits": [...],
    "cta": "..."
  }
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return {
      type,
      title: content.title,
      description: content.description,
      content: {
        valueProposition: content.valueProposition,
        outline: content.contentOutline,
        landingPage: content.landingPageCopy,
      },
    };
  }

  /**
   * Generate sales script
   */
  async generateSalesScript(
    business: BusinessSpec,
    stage: 'discovery' | 'presentation' | 'objection_handling' | 'closing'
  ): Promise<string> {
    const prompt = `Generate a ${stage} sales script for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Stage: ${stage}

Generate a conversational sales script that:
- Builds rapport (if discovery)
- Presents value clearly (if presentation)
- Addresses common objections (if objection_handling)
- Closes effectively (if closing)

Return as a structured script with talking points.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    return response;
  }

  /**
   * Generate pricing page
   */
  async generatePricingPage(business: BusinessSpec): Promise<any> {
    const prompt = `Design a pricing page for a ${business.businessType} business.

Business Model: ${business.businessModel}
Revenue Model: ${JSON.stringify(business.revenueModel)}
Target Audience: ${JSON.stringify(business.targetAudience)}

Generate:
1. Pricing tiers (2-4 tiers recommended)
2. Feature comparison
3. Value proposition for each tier
4. FAQ section
5. Social proof elements

Return as JSON:
{
  "headline": "...",
  "subheadline": "...",
  "tiers": [
    {
      "name": "...",
      "price": "...",
      "features": [...],
      "cta": "..."
    }
  ],
  "faq": [
    {"question": "...", "answer": "..."}
  ]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    return this.parseJSONResponse(response);
  }

  /**
   * Optimize conversion
   */
  async optimizeConversion(business: BusinessSpec, pageType: string): Promise<any> {
    const prompt = `Optimize a ${pageType} page for maximum conversions for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Generate conversion optimization recommendations:
1. Headline improvements
2. CTA optimization
3. Social proof placement
4. Trust signals
5. Urgency/scarcity elements
6. A/B test suggestions

Return as JSON with specific recommendations.`;

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

