import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import type { AppSpec, PageSpec } from '@omniforge/shared';

@Injectable()
export class ImageImportService {
  private readonly logger = new Logger(ImageImportService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || '';
  }

  async importFromImage(imageBase64: string): Promise<AppSpec> {
    if (!this.apiKey) {
      this.logger.warn('HUGGINGFACE_API_KEY not set, returning default layout');
      return this.getDefaultSpec('From Image');
    }

    try {
      const client = axios.create({
        baseURL: 'https://api-inference.huggingface.co/models',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      const captionRes = await client.post<string | { generated_text: string }[]>(
        'Salesforce/blip-image-captioning-base',
        { inputs: imageBase64 }
      );

      let description = '';
      if (typeof captionRes.data === 'string') {
        description = captionRes.data;
      } else if (Array.isArray(captionRes.data) && captionRes.data[0]) {
        const first = captionRes.data[0];
        description = typeof first === 'string' ? first : first.generated_text || '';
      }

      if (!description) return this.getDefaultSpec('From Image');

      const layoutSpec = await this.descriptionToLayout(description, client);
      return layoutSpec;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Image import failed: ${msg}`);
      return this.getDefaultSpec('From Image');
    }
  }

  private async descriptionToLayout(desc: string, client: AxiosInstance): Promise<AppSpec> {
    const prompt = `Given this image description, output JSON for a landing page layout.
Description: ${desc.slice(0, 500)}

Return ONLY valid JSON: {"name":"App","pages":[{"id":"home","name":"Home","path":"/","components":[
  {"id":"nav-1","type":"Navbar","props":{"title":"...","ctaLabel":"..."}},
  {"id":"hero-1","type":"Hero","props":{"title":"...","subtitle":"...","ctaLabel":"..."}},
  {"id":"fg-1","type":"FeatureGrid","props":{"title":"...","columns":3},"children":[{"id":"fc-1","type":"FeatureCard","props":{"icon":"🚀","title":"...","description":"..."}}]},
  {"id":"cta-1","type":"CTA","props":{"title":"...","buttonLabel":"..."}},
  {"id":"footer-1","type":"Footer","props":{"brand":"..."}}
]}]}
Use only: Navbar, Hero, FeatureGrid, FeatureCard, CTA, Footer.`;

    try {
      const res = await client.post<{ generated_text: string }[]>(
        'mistralai/Mistral-7B-Instruct-v0.2',
        { inputs: prompt, parameters: { max_new_tokens: 800, temperature: 0.2 } }
      );
      const text = Array.isArray(res.data) ? res.data[0]?.generated_text : '';
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { name?: string; pages?: PageSpec[] };
        return {
          version: '1.0',
          name: parsed.name || 'From Image',
          description: 'Imported from image',
          pages: parsed.pages || [],
          dataModels: [],
          apis: [],
          realtime: [],
          integrations: [],
          ui: { theme: 'light', primaryColor: '#3b82f6' },
          generatedAt: new Date().toISOString(),
        };
      }
    } catch {
      /* fall through */
    }
    return this.getDefaultSpec('From Image');
  }

  getDefaultSpec(source: string): AppSpec {
    return {
      version: '1.0',
      name: source,
      description: 'Imported from image',
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          components: [
            { id: 'nav-1', type: 'Navbar', props: { title: 'App', ctaLabel: 'Get Started' } },
            {
              id: 'hero-1',
              type: 'Hero',
              props: { title: 'Welcome', subtitle: 'From your image', ctaLabel: 'Learn More' },
            },
            {
              id: 'fg-1',
              type: 'FeatureGrid',
              props: { title: 'Features', columns: 3 },
              children: [
                {
                  id: 'fc-1',
                  type: 'FeatureCard',
                  props: { icon: '🚀', title: 'Fast', description: 'Quick.' },
                },
                {
                  id: 'fc-2',
                  type: 'FeatureCard',
                  props: { icon: '⚡', title: 'Simple', description: 'Easy.' },
                },
                {
                  id: 'fc-3',
                  type: 'FeatureCard',
                  props: { icon: '✨', title: 'Modern', description: 'Today.' },
                },
              ],
            },
            { id: 'cta-1', type: 'CTA', props: { title: 'Ready?', buttonLabel: 'Get Started' } },
            { id: 'footer-1', type: 'Footer', props: { brand: 'App' } },
          ],
        },
      ],
      dataModels: [],
      apis: [],
      realtime: [],
      integrations: [],
      ui: { theme: 'light', primaryColor: '#3b82f6' },
      generatedAt: new Date().toISOString(),
    };
  }
}
