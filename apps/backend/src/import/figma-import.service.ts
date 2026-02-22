import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import type { AppSpec, PageSpec, ComponentSpec } from '@omniforge/shared';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  characters?: string;
  absoluteBoundingBox?: { width: number; height: number };
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
}

interface FigmaFileResponse {
  name: string;
  document: FigmaNode;
  lastModified?: string;
}

/**
 * Figma Import Service
 * Uses Figma REST API to fetch file/frame and maps to OmniForge layout schema.
 */
@Injectable()
export class FigmaImportService {
  private readonly logger = new Logger(FigmaImportService.name);
  private readonly apiKey: string;
  private client: AxiosInstance | null = null;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FIGMA_ACCESS_TOKEN') || '';
    if (this.apiKey) {
      this.client = axios.create({
        baseURL: 'https://api.figma.com/v1',
        headers: { 'X-Figma-Token': this.apiKey },
        timeout: 15000,
      });
    }
  }

  /**
   * Import from Figma file URL or file key.
   * URL format: https://www.figma.com/file/FILE_KEY/...
   * Or pass fileKey directly.
   */
  async importFromFigma(urlOrKey: string, nodeId?: string): Promise<AppSpec> {
    if (!this.client) {
      this.logger.warn('FIGMA_ACCESS_TOKEN not set, returning default layout');
      return this.getDefaultSpec('From Figma');
    }

    const fileKey = this.extractFileKey(urlOrKey);
    if (!fileKey) {
      this.logger.error('Invalid Figma URL or file key');
      return this.getDefaultSpec('From Figma');
    }

    try {
      const endpoint = nodeId
        ? `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
        : `/files/${fileKey}`;
      const res = await this.client.get<FigmaFileResponse | { nodes: Record<string, { document: FigmaNode }> }>(endpoint);

      let doc: FigmaNode;
      let name = 'Figma Import';

      if (nodeId && 'nodes' in res.data && res.data.nodes[nodeId]) {
        doc = res.data.nodes[nodeId].document;
      } else if ('document' in res.data) {
        doc = res.data.document;
        name = res.data.name || name;
      } else {
        return this.getDefaultSpec(name);
      }

      const components = this.figmaNodeToComponents(doc);
      const page: PageSpec = {
        id: 'home',
        name: name.slice(0, 50),
        path: '/',
        components: components.length > 0 ? components : this.getDefaultComponents(),
      };

      return {
        version: '1.0',
        name,
        description: `Imported from Figma`,
        pages: [page],
        dataModels: [],
        apis: [],
        realtime: [],
        integrations: [],
        ui: { theme: 'light', primaryColor: '#3b82f6' },
        generatedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Figma import failed: ${msg}`);
      return this.getDefaultSpec('From Figma');
    }
  }

  private extractFileKey(urlOrKey: string): string | null {
    const match = urlOrKey.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    if (/^[a-zA-Z0-9]{20,}$/.test(urlOrKey)) return urlOrKey;
    return null;
  }

  private figmaNodeToComponents(node: FigmaNode, depth = 0): ComponentSpec[] {
    const components: ComponentSpec[] = [];
    if (depth > 5) return components;

    const children = node.children || [];
    const frame = children.find((c) => c.type === 'FRAME');
    const target = frame || node;

    let idx = 0;
    for (const child of target.children || []) {
      const type = this.inferComponentType(child);
      if (type) {
        idx++;
        const comp: ComponentSpec = {
          id: `${type.toLowerCase()}-${idx}`,
          type,
          props: this.extractProps(child, type),
        };
        if (child.children?.length && (type === 'FeatureGrid' || type === 'Section')) {
          comp.children = this.figmaNodeToComponents(child, depth + 1).slice(0, 6);
        }
        components.push(comp);
      }
    }

    return components;
  }

  private inferComponentType(node: FigmaNode): string | null {
    const name = node.name.toLowerCase();
    if (name.includes('nav') || name.includes('header')) return 'Navbar';
    if (name.includes('hero') || name.includes('banner')) return 'Hero';
    if (name.includes('feature') || name.includes('card grid')) return 'FeatureGrid';
    if (name.includes('card') || name.includes('item')) return 'FeatureCard';
    if (name.includes('cta') || name.includes('call')) return 'CTA';
    if (name.includes('footer')) return 'Footer';
    if (node.type === 'TEXT' && node.characters) return 'Heading';
    return null;
  }

  private extractProps(node: FigmaNode, type: string): Record<string, unknown> {
    const base: Record<string, unknown> = {};
    if (node.characters) {
      base.title = node.characters.slice(0, 80);
      base.subtitle = node.characters.slice(0, 120);
    }
    switch (type) {
      case 'Navbar':
        return { title: base.title || 'App', ctaLabel: 'Get Started' };
      case 'Hero':
        return { title: base.title || 'Welcome', subtitle: 'Get started today', ctaLabel: 'Learn More' };
      case 'FeatureGrid':
        return { title: 'Features', columns: 3 };
      case 'FeatureCard':
        return { icon: '🚀', title: base.title || 'Feature', description: 'Description' };
      case 'CTA':
        return { title: 'Ready to start?', buttonLabel: 'Get Started' };
      case 'Footer':
        return { brand: base.title || 'App' };
      default:
        return base;
    }
  }

  private getDefaultComponents(): ComponentSpec[] {
    return [
      { id: 'nav-1', type: 'Navbar', props: { title: 'App', ctaLabel: 'Get Started' } },
      { id: 'hero-1', type: 'Hero', props: { title: 'Welcome', subtitle: 'From Figma', ctaLabel: 'Learn More' } },
      {
        id: 'fg-1',
        type: 'FeatureGrid',
        props: { title: 'Features', columns: 3 },
        children: [
          { id: 'fc-1', type: 'FeatureCard', props: { icon: '🚀', title: 'Fast', description: 'Quick.' } },
          { id: 'fc-2', type: 'FeatureCard', props: { icon: '⚡', title: 'Simple', description: 'Easy.' } },
          { id: 'fc-3', type: 'FeatureCard', props: { icon: '✨', title: 'Modern', description: 'Today.' } },
        ],
      },
      { id: 'cta-1', type: 'CTA', props: { title: 'Ready?', buttonLabel: 'Get Started' } },
      { id: 'footer-1', type: 'Footer', props: { brand: 'App' } },
    ];
  }

  private getDefaultSpec(source: string): AppSpec {
    return {
      version: '1.0',
      name: source,
      description: 'Imported from Figma',
      pages: [{ id: 'home', name: 'Home', path: '/', components: this.getDefaultComponents() }],
      dataModels: [],
      apis: [],
      realtime: [],
      integrations: [],
      ui: { theme: 'light', primaryColor: '#3b82f6' },
      generatedAt: new Date().toISOString(),
    };
  }
}
