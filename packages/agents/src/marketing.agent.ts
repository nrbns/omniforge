import { LLMService } from '@omniforge/llm';

export interface MarketingAsset {
  type: 'landing_page' | 'ad_creative' | 'email_sequence' | 'blog_post' | 'social_post' | 'seo_tags' | 'brand_identity';
  title: string;
  content: {
    headline?: string;
    subheadline?: string;
    body?: string;
    cta?: string;
    images?: string[];
    tags?: string[];
    metadata?: Record<string, any>;
  };
  platform?: string;
  targetAudience?: string;
  tone?: string;
}

interface BusinessSpec {
  businessType: string;
  businessModel: string;
  targetAudience: any;
  revenueModel: any;
  marketingStrategy?: any;
  brandGuidelines?: any;
}

export class MarketingAgent {
  constructor(private llmService: LLMService) {}

  /**
   * Generate landing page copy
   */
  async generateLandingPage(business: BusinessSpec): Promise<MarketingAsset> {
    const prompt = `Generate a high-converting landing page for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Revenue Model: ${JSON.stringify(business.revenueModel)}

Generate:
1. Compelling headline (max 10 words)
2. Subheadline (max 20 words)
3. Value proposition (3-4 bullet points)
4. Social proof section
5. Strong CTA button text
6. SEO-optimized meta description

Return as JSON with structure:
{
  "headline": "...",
  "subheadline": "...",
  "valueProposition": ["...", "..."],
  "socialProof": "...",
  "cta": "...",
  "metaDescription": "..."
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'landing_page',
      title: `Landing Page - ${business.businessType}`,
      content: {
        headline: content.headline,
        subheadline: content.subheadline,
        body: content.valueProposition?.join('\n\n'),
        cta: content.cta,
        metadata: {
          socialProof: content.socialProof,
          metaDescription: content.metaDescription,
        },
      },
      targetAudience: JSON.stringify(business.targetAudience),
    };
  }

  /**
   * Generate ad creative for a platform
   */
  async generateAdCreative(
    business: BusinessSpec,
    platform: 'facebook' | 'google' | 'instagram' | 'linkedin'
  ): Promise<MarketingAsset> {
    const platformSpecs = {
      facebook: 'Facebook ad: Headline (40 chars), Primary text (125 chars), Description (30 chars)',
      google: 'Google ad: Headline (30 chars), Description (90 chars), Display URL',
      instagram: 'Instagram ad: Caption (125 chars), Hashtags (max 30)',
      linkedin: 'LinkedIn ad: Headline (75 chars), Description (75 chars)',
    };

    const prompt = `Generate a ${platform} ad creative for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Platform Requirements: ${platformSpecs[platform]}

Generate compelling ad copy that:
- Grabs attention immediately
- Highlights unique value proposition
- Includes strong call-to-action
- Matches platform best practices

Return as JSON with structure matching platform requirements.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.8,
      maxTokens: 500,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'ad_creative',
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Ad - ${business.businessType}`,
      content: {
        headline: content.headline,
        body: content.description || content.primaryText || content.caption,
        cta: content.cta,
        tags: content.hashtags || [],
        metadata: content,
      },
      platform,
      targetAudience: JSON.stringify(business.targetAudience),
    };
  }

  /**
   * Generate email sequence
   */
  async generateEmailSequence(
    business: BusinessSpec,
    sequenceType: 'welcome' | 'nurture' | 'sales' | 're-engagement'
  ): Promise<MarketingAsset[]> {
    const sequenceLengths = {
      welcome: 3,
      nurture: 5,
      sales: 4,
      're-engagement': 3,
    };

    const emails: MarketingAsset[] = [];
    const length = sequenceLengths[sequenceType];

    for (let i = 0; i < length; i++) {
      const prompt = `Generate email ${i + 1} of ${length} for a ${sequenceType} email sequence.

Business: ${business.businessType}
Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Email ${i + 1} should:
- Be appropriate for ${sequenceType} sequence
- Build on previous emails (if any)
- Include clear value proposition
- Have compelling subject line
- Include CTA

Return as JSON:
{
  "subject": "...",
  "preheader": "...",
  "body": "...",
  "cta": "..."
}`;

      const response = await this.llmService.generate(prompt, {
        temperature: 0.7,
        maxTokens: 800,
      });

      const content = this.parseJSONResponse(response);

      emails.push({
        type: 'email_sequence',
        title: `${sequenceType.charAt(0).toUpperCase() + sequenceType.slice(1)} Email ${i + 1}`,
        content: {
          headline: content.subject,
          subheadline: content.preheader,
          body: content.body,
          cta: content.cta,
          metadata: {
            sequenceType,
            sequencePosition: i + 1,
            totalEmails: length,
          },
        },
        platform: 'email',
      });
    }

    return emails;
  }

  /**
   * Generate blog post
   */
  async generateBlogPost(business: BusinessSpec, topic?: string): Promise<MarketingAsset> {
    const prompt = `Generate a SEO-optimized blog post for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}
Topic: ${topic || 'General industry topic relevant to the business'}

Generate:
1. SEO-optimized title (60 chars max)
2. Meta description (160 chars)
3. Introduction paragraph
4. 3-5 main sections with headings
5. Conclusion with CTA
6. 5-10 relevant keywords/tags

Return as JSON:
{
  "title": "...",
  "metaDescription": "...",
  "introduction": "...",
  "sections": [
    {"heading": "...", "content": "..."}
  ],
  "conclusion": "...",
  "keywords": ["...", "..."]
}`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2500,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'blog_post',
      title: content.title,
      content: {
        headline: content.title,
        subheadline: content.metaDescription,
        body: [
          content.introduction,
          ...(content.sections || []).map((s: any) => `## ${s.heading}\n\n${s.content}`),
          content.conclusion,
        ].join('\n\n'),
        tags: content.keywords || [],
        metadata: {
          metaDescription: content.metaDescription,
        },
      },
      platform: 'blog',
    };
  }

  /**
   * Generate SEO tags
   */
  async generateSEOTags(business: BusinessSpec): Promise<MarketingAsset> {
    const prompt = `Generate comprehensive SEO tags and metadata for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Generate:
1. Primary keyword
2. 5-10 secondary keywords
3. Meta title (60 chars)
4. Meta description (160 chars)
5. Open Graph tags
6. Twitter Card tags
7. Schema.org structured data suggestions

Return as JSON with all tags.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.5,
      maxTokens: 800,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'seo_tags',
      title: 'SEO Tags & Metadata',
      content: {
        tags: [
          content.primaryKeyword,
          ...(content.secondaryKeywords || []),
        ],
        metadata: {
          metaTitle: content.metaTitle,
          metaDescription: content.metaDescription,
          openGraph: content.openGraph,
          twitterCard: content.twitterCard,
          schema: content.schema,
        },
      },
    };
  }

  /**
   * Generate brand identity
   */
  async generateBrandIdentity(business: BusinessSpec): Promise<MarketingAsset> {
    const prompt = `Generate a complete brand identity for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Generate:
1. Brand name suggestions (3-5 options)
2. Tagline/slogan (3-5 options)
3. Brand personality (5 adjectives)
4. Brand voice & tone description
5. Color palette (primary, secondary, accent - hex codes)
6. Typography recommendations
7. Brand values (3-5 core values)

Return as JSON with all brand elements.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.8,
      maxTokens: 1000,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'brand_identity',
      title: 'Brand Identity',
      content: {
        headline: content.brandNames?.[0] || 'Brand Name',
        subheadline: content.taglines?.[0] || 'Tagline',
        body: JSON.stringify({
          brandNames: content.brandNames,
          taglines: content.taglines,
          personality: content.personality,
          voice: content.voice,
          colors: content.colors,
          typography: content.typography,
          values: content.values,
        }, null, 2),
        metadata: content,
      },
    };
  }

  /**
   * Generate social media post
   */
  async generateSocialPost(
    business: BusinessSpec,
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
  ): Promise<MarketingAsset> {
    const platformSpecs = {
      facebook: '280 characters, engaging, can include questions',
      instagram: '2200 characters, visual-first, use emojis, hashtags',
      twitter: '280 characters, concise, can use hashtags',
      linkedin: '3000 characters, professional, value-focused',
    };

    const prompt = `Generate a ${platform} social media post for a ${business.businessType} business.

Business Model: ${business.businessModel}
Target Audience: ${JSON.stringify(business.targetAudience)}

Platform Requirements: ${platformSpecs[platform]}

Generate:
1. Post copy (within character limit)
2. 3-5 relevant hashtags
3. Engagement hook (question or call-to-action)

Return as JSON.`;

    const response = await this.llmService.generate(prompt, {
      temperature: 0.8,
      maxTokens: 400,
    });

    const content = this.parseJSONResponse(response);

    return {
      type: 'social_post',
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Post`,
      content: {
        body: content.post,
        tags: content.hashtags || [],
        cta: content.engagementHook,
        metadata: {
          platform,
        },
      },
      platform,
    };
  }

  /**
   * Parse JSON response from LLM
   */
  private parseJSONResponse(response: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      // Try direct JSON parse
      return JSON.parse(response);
    } catch (error) {
      // Fallback: return as text
      return { content: response };
    }
  }
}

