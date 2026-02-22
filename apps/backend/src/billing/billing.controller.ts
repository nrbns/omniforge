import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillingService, PlanType } from './billing.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Get('user/:userId/plan')
  @ApiOperation({ summary: "Get user's current plan" })
  @ApiResponse({ status: 200, description: 'User plan' })
  async getUserPlan(@Param('userId') userId: string) {
    return this.billingService.getUserPlan(userId);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 200, description: 'Subscription created' })
  async createSubscription(
    @Body() body: { userId: string; planId: PlanType; paymentMethodId?: string }
  ) {
    return this.billingService.createSubscription(body.userId, body.planId, body.paymentMethodId);
  }

  @Get('user/:userId/usage')
  @ApiOperation({ summary: 'Get user usage stats' })
  @ApiResponse({ status: 200, description: 'Usage stats' })
  async getUsage(@Param('userId') userId: string) {
    return this.billingService.getUsage(userId);
  }
}
