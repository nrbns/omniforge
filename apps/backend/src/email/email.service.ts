import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly sendGridApiKey?: string;
  private readonly mailgunApiKey?: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@omniforge.dev';
    this.sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.mailgunApiKey = this.configService.get<string>('MAILGUN_API_KEY');

    if (!this.sendGridApiKey && !this.mailgunApiKey) {
      this.logger.warn('⚠️ No email service configured. Running in mock mode.');
    } else {
      this.logger.log('✅ Email service initialized');
    }
  }

  /**
   * Send email (mock implementation - in production, use SendGrid/Mailgun)
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    // Mock implementation for demo mode
    if (!this.sendGridApiKey && !this.mailgunApiKey) {
      this.logger.log(`[MOCK] Sending email to ${options.to}: ${options.subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    // TODO: Implement actual SendGrid/Mailgun integration
    // For now, return mock response
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    return { success: true, messageId: `email-${Date.now()}` };
  }

  /**
   * Send email campaign (batch)
   */
  async sendCampaign(emails: EmailOptions[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await this.sendEmail(email);
        success++;
      } catch (error) {
        this.logger.error(`Failed to send email to ${email.to}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Render MJML template to HTML
   */
  async renderMJML(mjml: string): Promise<string> {
    // TODO: Use mjml library to render
    // For now, return as-is (assuming HTML)
    return mjml;
  }
}

