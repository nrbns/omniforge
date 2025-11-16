import { LLMService } from '@omniforge/llm';

export interface Workflow {
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  event?: string; // e.g., 'contact.created', 'deal.stage_changed'
  schedule?: string; // CRON expression
  webhook?: string;
  conditions?: any;
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'crm_update' | 'notification' | 'delay' | 'condition';
  config: any;
  nextStepId?: string;
}

interface BusinessSpec {
  businessType: string;
  businessModel: string;
  targetAudience: any;
  crmConfig?: any;
  integrations?: string[];
}

export class WorkflowAgent {
  constructor(private llmService: LLMService) {}

  /**
   * Generate workflow based on trigger
   */
  async generateWorkflow(
    business: BusinessSpec,
    triggerType: string,
    triggerConfig?: any
  ): Promise<Workflow> {
    const prompt = `Design an automation workflow for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Trigger: ${triggerType}
Trigger Config: ${JSON.stringify(triggerConfig || {})}

Create a workflow that:
1. Defines the trigger clearly
2. Includes 3-5 automation steps
3. Handles common scenarios
4. Includes error handling

Available step types:
- email: Send email
- sms: Send SMS
- webhook: Call external API
- crm_update: Update CRM record
- notification: Send notification
- delay: Wait for specified time
- condition: Conditional logic

Return as JSON:
{
  "name": "...",
  "description": "...",
  "trigger": {
    "type": "...",
    "event": "...",
    "conditions": {...}
  },
  "steps": [
    {
      "id": "step1",
      "type": "...",
      "config": {...},
      "nextStepId": "step2"
    }
  ]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: content.name || `Workflow: ${triggerType}`,
      description: content.description || 'Automated workflow',
      trigger: content.trigger || { type: triggerType },
      steps: content.steps || [],
    };
  }

  /**
   * Generate email drip sequence workflow
   */
  async generateEmailDrip(
    business: BusinessSpec,
    sequenceType: 'welcome' | 'nurture' | 're-engagement'
  ): Promise<Workflow> {
    const sequenceLengths = {
      welcome: 3,
      nurture: 5,
      're-engagement': 3,
    };

    const length = sequenceLengths[sequenceType];

    const prompt = `Create an email drip sequence workflow for a ${business.businessType} business.

Business Model: ${business.businessModel}
Sequence Type: ${sequenceType}
Number of Emails: ${length}

Create a workflow that:
1. Triggers when a contact is added
2. Sends ${length} emails with delays between them
3. Each email builds on the previous
4. Includes unsubscribe handling

Return as JSON workflow definition.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: `${sequenceType.charAt(0).toUpperCase() + sequenceType.slice(1)} Email Drip`,
      description: `Automated ${sequenceType} email sequence`,
      trigger: {
        type: 'event',
        event: 'contact.created',
      },
      steps: content.steps || [],
    };
  }

  /**
   * Generate lead scoring workflow
   */
  async generateLeadScoring(business: BusinessSpec): Promise<Workflow> {
    const prompt = `Create a lead scoring workflow for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Create a workflow that:
1. Scores leads based on behavior and attributes
2. Updates lead score in CRM
3. Triggers actions based on score thresholds
4. Handles score decay over time

Scoring factors to consider:
- Email opens/clicks
- Website visits
- Form submissions
- Demo requests
- Engagement level

Return as JSON workflow definition.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: 'Lead Scoring Automation',
      description: 'Automatically score and qualify leads',
      trigger: {
        type: 'event',
        event: 'lead.activity',
      },
      steps: content.steps || [],
    };
  }

  /**
   * Generate CRM flow workflow
   */
  async generateCRMFlow(business: BusinessSpec, stage: string): Promise<Workflow> {
    const prompt = `Create a CRM workflow for when a deal moves to "${stage}" stage.

Business Model: ${business.businessModel}
Stage: ${stage}

Create a workflow that:
1. Triggers on deal stage change
2. Performs appropriate actions for the stage
3. Sends notifications
4. Updates related records
5. Schedules follow-ups

Return as JSON workflow definition.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: `CRM Flow: ${stage}`,
      description: `Automation for ${stage} stage`,
      trigger: {
        type: 'event',
        event: 'deal.stage_changed',
        conditions: {
          stage,
        },
      },
      steps: content.steps || [],
    };
  }

  /**
   * Generate webhook workflow
   */
  async generateWebhook(business: BusinessSpec, event: string): Promise<Workflow> {
    const prompt = `Create a webhook-based workflow for a ${business.businessType} business.

Business Model: ${business.businessModel}
Event: ${event}

Create a workflow that:
1. Receives webhook data
2. Processes the payload
3. Performs actions based on data
4. Sends responses/notifications

Return as JSON workflow definition.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return {
      name: `Webhook: ${event}`,
      description: `Webhook handler for ${event}`,
      trigger: {
        type: 'webhook',
        webhook: `/webhooks/${event}`,
      },
      steps: content.steps || [],
    };
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

