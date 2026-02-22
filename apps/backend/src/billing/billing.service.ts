import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../integrations/stripe/stripe.service';

export enum PlanType {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number; // Monthly price in cents
  features: string[];
  limits: {
    ideas: number;
    builds: number;
    agents: number;
    storage: number; // MB
  };
}

const PLANS: Record<PlanType, Plan> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'Free',
    price: 0,
    features: ['5 ideas per month', '10 builds per month', 'Basic agents', 'Community support'],
    limits: {
      ideas: 5,
      builds: 10,
      agents: 3,
      storage: 100,
    },
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    price: 900, // $9.00 in cents
    features: [
      'Unlimited ideas',
      'Unlimited builds',
      'All agents',
      'Priority support',
      'Advanced analytics',
      'Export templates',
    ],
    limits: {
      ideas: -1, // Unlimited
      builds: -1,
      agents: -1,
      storage: 1000,
    },
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Enterprise',
    price: 9900, // $99.00 in cents
    features: [
      'Everything in Pro',
      'SSO',
      'Advanced RBAC',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      ideas: -1,
      builds: -1,
      agents: -1,
      storage: 10000,
    },
  },
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService
  ) {}

  /**
   * Get all available plans
   */
  getPlans(): Plan[] {
    return Object.values(PLANS);
  }

  /**
   * Get user's current plan
   */
  async getUserPlan(userId: string): Promise<Plan> {
    // TODO: Query from database
    // For now, return FREE
    return PLANS[PlanType.FREE];
  }

  /**
   * Create subscription
   */
  async createSubscription(
    userId: string,
    planId: PlanType,
    paymentMethodId?: string
  ): Promise<any> {
    const plan = PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    if (plan.price === 0) {
      // Free plan - no subscription needed
      // TODO: Update user plan in database
      return { plan, subscription: null };
    }

    // Create Stripe subscription
    try {
      // TODO: Create Stripe customer if not exists
      // TODO: Create subscription with payment method
      // TODO: Store subscription in database

      this.logger.log(`Creating subscription for user ${userId} to plan ${planId}`);
      return {
        plan,
        subscription: {
          id: 'sub_mock',
          status: 'active',
        },
      };
    } catch (error) {
      this.logger.error('Failed to create subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Check if user can perform action (based on plan limits)
   */
  async checkLimit(
    userId: string,
    action: 'idea' | 'build' | 'agent' | 'storage'
  ): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    const limit =
      plan.limits[
        action === 'idea'
          ? 'ideas'
          : action === 'build'
            ? 'builds'
            : action === 'agent'
              ? 'agents'
              : 'storage'
      ];

    if (limit === -1) {
      return true; // Unlimited
    }

    // TODO: Check actual usage from database
    // For now, return true
    return true;
  }

  /**
   * Get usage stats for user
   */
  async getUsage(userId: string): Promise<Record<string, number>> {
    // TODO: Query actual usage from database
    return {
      ideas: 0,
      builds: 0,
      agents: 0,
      storage: 0,
    };
  }
}
