import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';

@ApiTags('agents')
@Controller('agents')
export class PopupController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('popup')
  @ApiOperation({ summary: 'Generate AI popup configuration' })
  @ApiResponse({ status: 200, description: 'Popup generated successfully' })
  async generatePopup(@Body() body: { ideaId?: string; context?: string }) {
    // Generate popup using AI (simplified)
    const popup = {
      type: 'exit-intent' as const,
      trigger: {},
      content: {
        title: 'Wait! Don\'t miss out',
        message: body.context === 'cart abandonment'
          ? 'Complete your purchase and get 10% off!'
          : 'Get exclusive offers delivered to your inbox',
        cta: 'Claim Offer',
        ctaUrl: '#',
        discount: 10,
      },
      design: {
        position: 'center' as const,
        theme: 'light' as const,
      },
    };

    return popup;
  }
}

