import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LeadScoreFactors {
  emailOpened?: boolean;
  emailClicked?: boolean;
  websiteVisited?: boolean;
  formSubmitted?: boolean;
  timeOnSite?: number; // seconds
  pagesViewed?: number;
  source?: string;
  companySize?: string;
  industry?: string;
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate lead score
   */
  async calculateLeadScore(leadId: string, factors: LeadScoreFactors): Promise<number> {
    let score = 0;

    // Email engagement (0-30 points)
    if (factors.emailOpened) score += 10;
    if (factors.emailClicked) score += 20;

    // Website engagement (0-30 points)
    if (factors.websiteVisited) score += 10;
    if (factors.pagesViewed && factors.pagesViewed > 3) score += 10;
    if (factors.timeOnSite && factors.timeOnSite > 120) score += 10;

    // Form submission (0-20 points)
    if (factors.formSubmitted) score += 20;

    // Source quality (0-10 points)
    if (factors.source === 'organic' || factors.source === 'referral') score += 10;
    if (factors.source === 'paid') score += 5;

    // Company size (0-10 points)
    if (factors.companySize === 'enterprise') score += 10;
    if (factors.companySize === 'mid-market') score += 5;

    // Cap at 100
    score = Math.min(score, 100);

    // Update lead score in database
    // TODO: Update Lead model with score
    this.logger.log(`Lead ${leadId} scored: ${score}/100`);

    return score;
  }

  /**
   * Auto-qualify leads based on score
   */
  async autoQualifyLead(leadId: string, score: number): Promise<boolean> {
    const threshold = 70; // Qualify if score >= 70
    const qualified = score >= threshold;

    if (qualified) {
      // TODO: Update lead status to 'qualified' in database
      this.logger.log(`Lead ${leadId} auto-qualified (score: ${score})`);
    }

    return qualified;
  }

  /**
   * Get lead scoring breakdown
   */
  async getScoringBreakdown(leadId: string): Promise<any> {
    // TODO: Return detailed breakdown
    return {
      leadId,
      totalScore: 0,
      factors: {},
    };
  }
}
