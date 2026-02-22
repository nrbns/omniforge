import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Idea, Project, Deployment } from '@prisma/client';

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private realtimeService: RealtimeService,
    @InjectQueue('idea-parser') private ideaParserQueue: Queue,
    @InjectQueue('build') private buildQueue: Queue,
    @InjectQueue('deploy') private deployQueue: Queue
  ) {}

  async parseIdea(idea: Idea): Promise<any> {
    // Queue idea parsing job
    await this.ideaParserQueue.add('parse', {
      ideaId: idea.id,
      rawInput: idea.rawInput,
      title: idea.title,
      description: idea.description,
    });

    // For now, return a mock spec structure
    // In production, this will call the actual IdeaParserAgent
    return this.generateMockSpec(idea);
  }

  async buildProject(project: Project & { idea: Idea }, buildId: string): Promise<void> {
    await this.buildQueue.add('build', {
      projectId: project.id,
      buildId,
      ideaId: project.ideaId,
      spec: project.idea.specJson,
      config: project.config,
    });

    // Update build status
    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Emit realtime event
    await this.realtimeService.emit(`build:${buildId}`, 'build.started', {
      id: buildId,
      status: 'RUNNING',
    });
  }

  async deployProject(
    deployment: Deployment & { project: Project & { idea: Idea } }
  ): Promise<void> {
    await this.deployQueue.add('deploy', {
      deploymentId: deployment.id,
      projectId: deployment.projectId,
      platform: deployment.platform,
      config: deployment.config,
    });

    // Update deployment status
    await this.prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'DEPLOYING',
      },
    });

    // Emit realtime event
    await this.realtimeService.emit(`deployment:${deployment.id}`, 'deployment.started', {
      id: deployment.id,
      status: 'DEPLOYING',
    });
  }

  async generateWorkflow(
    prompt: string,
    ideaId?: string
  ): Promise<{
    nodes: any[];
    edges: any[];
    metadata: any;
  }> {
    // Generate workflow using real LLM
    try {
      // Get LLMService from injection (if available)
      // For now, use structured prompt to generate workflow JSON
      const workflowPrompt = `Generate a workflow JSON for: "${prompt}"

Return a JSON object with this structure:
{
  "nodes": [
    {
      "id": "1",
      "type": "webhook|ai|email|database|api|conditional|action",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Node name",
        "description": "What this node does",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ]
}

Node types available:
- webhook: Receives external webhook events
- ai: AI processing/classification
- email: Sends email
- database: Database query
- api: External API call
- conditional: If/else logic
- action: Custom action

Generate a workflow that makes sense for: "${prompt}"`;

      // TODO: Call LLMService.generate() with workflowPrompt
      // For now, use intelligent mock based on prompt keywords
      const nodes: any[] = [];
      const edges: any[] = [];
      let nodeId = 1;

      // Detect workflow type from prompt
      const lowerPrompt = prompt.toLowerCase();

      if (
        lowerPrompt.includes('payment') ||
        lowerPrompt.includes('stripe') ||
        lowerPrompt.includes('checkout')
      ) {
        nodes.push({
          id: String(nodeId++),
          type: 'webhook',
          position: { x: 100, y: 100 },
          data: { label: 'Payment Webhook', description: 'Receives payment event' },
        });
        nodes.push({
          id: String(nodeId++),
          type: 'ai',
          position: { x: 300, y: 100 },
          data: { label: 'AI Classify', description: 'Classify payment type' },
        });
        nodes.push({
          id: String(nodeId++),
          type: 'email',
          position: { x: 500, y: 100 },
          data: { label: 'Send Confirmation', description: 'Send order confirmation email' },
        });
        edges.push({ id: 'e1-2', source: nodes[0].id, target: nodes[1].id });
        edges.push({ id: 'e2-3', source: nodes[1].id, target: nodes[2].id });
      } else if (lowerPrompt.includes('lead') || lowerPrompt.includes('contact')) {
        nodes.push({
          id: String(nodeId++),
          type: 'webhook',
          position: { x: 100, y: 100 },
          data: { label: 'Lead Form', description: 'New lead submitted' },
        });
        nodes.push({
          id: String(nodeId++),
          type: 'database',
          position: { x: 300, y: 100 },
          data: { label: 'Save to CRM', description: 'Store lead in database' },
        });
        nodes.push({
          id: String(nodeId++),
          type: 'email',
          position: { x: 500, y: 100 },
          data: { label: 'Welcome Email', description: 'Send welcome email to lead' },
        });
        edges.push({ id: 'e1-2', source: nodes[0].id, target: nodes[1].id });
        edges.push({ id: 'e2-3', source: nodes[1].id, target: nodes[2].id });
      } else {
        // Default workflow
        nodes.push({
          id: String(nodeId++),
          type: 'webhook',
          position: { x: 100, y: 100 },
          data: { label: 'Trigger', description: 'Workflow trigger' },
        });
        nodes.push({
          id: String(nodeId++),
          type: 'action',
          position: { x: 300, y: 100 },
          data: { label: 'Process', description: 'Process the event' },
        });
        edges.push({ id: 'e1-2', source: nodes[0].id, target: nodes[1].id });
      }

      return {
        nodes,
        edges,
        metadata: {
          prompt,
          ideaId,
          generatedAt: new Date().toISOString(),
          model: 'intelligent-mock', // TODO: Replace with actual LLM model name
        },
      };
    } catch (error) {
      // Fallback to simple mock
      return {
        nodes: [
          {
            id: '1',
            type: 'webhook',
            position: { x: 100, y: 100 },
            data: { label: 'Webhook', description: 'Trigger workflow' },
          },
        ],
        edges: [],
        metadata: {
          prompt,
          ideaId,
          generatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private generateMockSpec(idea: Idea): any {
    return {
      version: '1.0.0',
      name: idea.title,
      description: idea.description || '',
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          components: [],
        },
      ],
      dataModels: [],
      apis: [],
      realtime: [],
      integrations: [],
      ui: {
        theme: 'light',
        primaryColor: '#3b82f6',
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
