import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(
    @Body()
    body: {
      to: string | string[];
      subject: string;
      html?: string;
      text?: string;
      from?: string;
    }
  ) {
    return this.emailService.sendEmail(body);
  }

  @Post('campaign')
  @ApiOperation({ summary: 'Send email campaign (batch)' })
  @ApiResponse({ status: 200, description: 'Campaign sent' })
  async sendCampaign(
    @Body()
    body: {
      emails: Array<{
        to: string;
        subject: string;
        html?: string;
        text?: string;
      }>;
    }
  ) {
    return this.emailService.sendCampaign(body.emails);
  }
}
