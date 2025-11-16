import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { StripeService } from '../integrations/stripe/stripe.service';

interface WorkflowNode {
  id: string;
  type: 'webhook' | 'ai' | 'email' | 'action' | 'database' | 'api' | 'conditional';
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface Workflow {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(
    @InjectQueue('workflow') private workflowQueue: Queue,
    private prisma: PrismaService,
    private emailService: EmailService,
    private stripeService: StripeService,
  ) {}

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: Workflow, triggerData?: Record<string, any>): Promise<void> {
    this.logger.log(`Executing workflow ${workflow.id}`);

    // Find start nodes (nodes with no incoming edges)
    const startNodes = workflow.nodes.filter(
      (node) => !workflow.edges.some((edge) => edge.target === node.id),
    );

    // Execute each start node
    for (const node of startNodes) {
      await this.executeNode(node, workflow, triggerData);
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    workflow: Workflow,
    inputData?: Record<string, any>,
  ): Promise<any> {
    this.logger.log(`Executing node ${node.id} (${node.type})`);

    let output: any;

    switch (node.type) {
      case 'webhook':
        // Webhook nodes receive data from external sources
        output = inputData || {};
        break;

      case 'ai':
        // AI classification/processing
        output = await this.executeAINode(node, inputData);
        break;

      case 'email':
        // Send email
        output = await this.executeEmailNode(node, inputData);
        break;

      case 'database':
        // Query database
        output = await this.executeDatabaseNode(node, inputData);
        break;

      case 'api':
        // Call external API
        output = await this.executeAPINode(node, inputData);
        break;

      case 'conditional':
        // If/else logic
        output = await this.executeConditionalNode(node, inputData);
        break;

      case 'action':
        // Custom action
        output = await this.executeActionNode(node, inputData);
        break;

      default:
        this.logger.warn(`Unknown node type: ${node.type}`);
        output = inputData;
    }

    // Find next nodes (nodes connected from this node)
    const nextEdges = workflow.edges.filter((edge) => edge.source === node.id);
    for (const edge of nextEdges) {
      const nextNode = workflow.nodes.find((n) => n.id === edge.target);
      if (nextNode) {
        await this.executeNode(nextNode, workflow, output);
      }
    }

    return output;
  }

  private async executeAINode(node: WorkflowNode, inputData?: Record<string, any>): Promise<any> {
    // TODO: Call AI service for classification/processing
    this.logger.log(`AI node processing: ${node.data.label}`);
    return { ...inputData, classified: true };
  }

  private async executeEmailNode(
    node: WorkflowNode,
    inputData?: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    await this.emailService.sendEmail({
      to: config.to || inputData?.email || 'user@example.com',
      subject: config.subject || node.data.label,
      html: config.html || inputData?.emailBody || '',
    });
    return { ...inputData, emailSent: true };
  }

  private async executeDatabaseNode(
    node: WorkflowNode,
    inputData?: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    // TODO: Execute database query
    this.logger.log(`Database query: ${config.query || 'SELECT'}`);
    return { ...inputData, queryResult: [] };
  }

  private async executeAPINode(
    node: WorkflowNode,
    inputData?: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    // TODO: Call external API
    this.logger.log(`API call: ${config.url || 'N/A'}`);
    return { ...inputData, apiResponse: {} };
  }

  private async executeConditionalNode(
    node: WorkflowNode,
    inputData?: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    const condition = config.condition || 'true';
    // TODO: Evaluate condition
    const result = this.evaluateCondition(condition, inputData);
    return { ...inputData, conditionResult: result };
  }

  private async executeActionNode(
    node: WorkflowNode,
    inputData?: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    // TODO: Execute custom action
    this.logger.log(`Action: ${config.action || 'N/A'}`);
    return { ...inputData, actionCompleted: true };
  }

  private evaluateCondition(condition: string, data?: Record<string, any>): boolean {
    // Simple condition evaluation (in production, use a proper expression evaluator)
    try {
      // eslint-disable-next-line no-eval
      return eval(condition.replace(/\$\{(\w+)\}/g, (_, key) => `data?.${key}`));
    } catch {
      return false;
    }
  }

  /**
   * Queue workflow execution
   */
  async queueWorkflow(workflowId: string, workflow: Workflow, triggerData?: Record<string, any>): Promise<void> {
    await this.workflowQueue.add('execute', {
      workflowId,
      workflow,
      triggerData,
    });
  }
}

