import { LLMService } from '@omniforge/llm';

export interface CRMConfig {
  customFields: CustomField[];
  pipeline: PipelineStage[];
  automationRules: any[];
}

export interface CustomField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'email' | 'phone';
  label: string;
  required?: boolean;
  options?: string[];
}

export interface PipelineStage {
  name: string;
  order: number;
  probability: number; // 0-100
}

interface BusinessSpec {
  businessType: string;
  businessModel: string;
  targetAudience: any;
  salesProcess?: any;
}

export class CRMAgent {
  constructor(private llmService: LLMService) {}

  /**
   * Generate CRM configuration
   */
  async generateCRM(business: BusinessSpec): Promise<CRMConfig> {
    const prompt = `Design a CRM system for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Sales Process: ${JSON.stringify(business.salesProcess || {})}

Create:
1. Custom fields for contacts (5-10 relevant fields)
2. Sales pipeline stages (5-7 stages)
3. Deal stages with probabilities
4. Automation rules (3-5 rules)

Return as JSON:
{
  "customFields": [
    {"name": "...", "type": "...", "label": "...", "required": true/false}
  ],
  "pipeline": [
    {"name": "...", "order": 1, "probability": 10}
  ],
  "automationRules": [...]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      customFields: content.customFields || [],
      pipeline: content.pipeline || [],
      automationRules: content.automationRules || [],
    };
  }

  /**
   * Generate sales pipeline
   */
  async generatePipeline(business: BusinessSpec): Promise<PipelineStage[]> {
    const prompt = `Design a sales pipeline for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Create 5-7 pipeline stages with:
- Stage name
- Order (1, 2, 3...)
- Win probability (0-100%)

Typical stages:
1. Prospecting (10%)
2. Qualification (25%)
3. Proposal (50%)
4. Negotiation (75%)
5. Closed Won (100%)
6. Closed Lost (0%)

Return as JSON array of stages.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    const content = this.parseJSONResponse(response);

    return content.pipeline || content.stages || [];
  }

  /**
   * Generate custom fields
   */
  async generateCustomFields(business: BusinessSpec): Promise<CustomField[]> {
    const prompt = `Design custom fields for a CRM system for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Generate 5-10 custom fields that are:
- Relevant to the business type
- Useful for segmentation
- Helpful for sales process

Field types: text, number, date, select, boolean, email, phone

Return as JSON array of custom fields.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return content.customFields || content.fields || [];
  }

  /**
   * Generate automation rules
   */
  async generateAutomationRules(business: BusinessSpec): Promise<any[]> {
    const prompt = `Design automation rules for a CRM system for a ${business.businessType} business.

Business Model: ${business.businessModel}

Create 3-5 automation rules such as:
- Auto-assign leads based on criteria
- Send welcome email to new contacts
- Update deal stage based on activity
- Create tasks for sales team
- Notify on important events

Return as JSON array of automation rules.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return content.automationRules || content.rules || [];
  }

  /**
   * Generate lead scoring configuration
   */
  async generateLeadScoring(business: BusinessSpec): Promise<any> {
    const prompt = `Design a lead scoring system for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Create scoring rules:
- Positive scores (email opens, form fills, demo requests)
- Negative scores (unsubscribes, bounces)
- Score thresholds (hot, warm, cold)
- Actions based on scores

Return as JSON:
{
  "rules": [
    {"action": "...", "points": 10, "description": "..."}
  ],
  "thresholds": {
    "hot": 80,
    "warm": 50,
    "cold": 0
  }
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

