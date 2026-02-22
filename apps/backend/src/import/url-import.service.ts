import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AppSpec, PageSpec, ComponentSpec } from '@omniforge/shared';

@Injectable()
export class UrlImportService {
  private readonly logger = new Logger(UrlImportService.name);

  async importFromUrl(url: string): Promise<AppSpec> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; OmniForge/1.0; +https://omniforge.dev)',
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const html = response.data as string;
    const $ = cheerio.load(html);

    const components: ComponentSpec[] = [];
    const title =
      $('title').first().text().trim() ||
      $('h1').first().text().trim() ||
      new URL(url).hostname;

    const nav = $('nav').first().length ? $('nav').first() : $('header').first();
    if (nav?.length) {
      const firstLink = nav.find('a').first().text().trim();
      components.push({
        id: 'nav-1',
        type: 'Navbar',
        props: {
          title: firstLink || title.slice(0, 20),
          ctaLabel: 'Get Started',
        },
      });
    }

    const heroH1 = $('h1').first();
    if (heroH1.length) {
      const heroSection = heroH1.closest('section, div').first();
      const subtitle = heroSection.find('p').first().text().trim();
      const cta = heroSection.find('a, button').first().text().trim();
      components.push({
        id: 'hero-1',
        type: 'Hero',
        props: {
          title: heroH1.text().trim().slice(0, 80),
          subtitle: subtitle.slice(0, 120) || 'Discover more',
          ctaLabel: cta.slice(0, 30) || 'Learn More',
        },
      });
    }

    const sections = $('section, [class*="feature"], [class*="card"]');
    const featureCards: ComponentSpec[] = [];
    let cardIndex = 0;
    const icons = ['🚀', '⚡', '💡', '🔒', '📦', '✨'];

    sections.each((_, el) => {
      const $el = $(el);
      const cards = $el.find('[class*="card"], article');
      if (cards.length >= 2) {
        cards.slice(0, 6).each((__, cardEl) => {
          const $card = $(cardEl);
          const heading = $card.find('h2, h3, h4').first().text().trim();
          const desc = $card.find('p').first().text().trim();
          if (heading || desc) {
            cardIndex++;
            featureCards.push({
              id: `fc-${cardIndex}`,
              type: 'FeatureCard',
              props: {
                icon: icons[(cardIndex - 1) % 6],
                title: heading.slice(0, 50) || `Feature ${cardIndex}`,
                description: desc.slice(0, 100) || 'Feature description',
              },
            });
          }
        });
      }
    });

    if (featureCards.length > 0) {
      components.push({
        id: 'fg-1',
        type: 'FeatureGrid',
        props: { title: 'Features', columns: Math.min(3, featureCards.length) },
        children: featureCards.slice(0, 6),
      });
    }

    const ctaSection = $('[class*="cta"], [class*="newsletter"]').first();
    if (ctaSection.length) {
      const ctaTitle = ctaSection.find('h2, h3').first().text().trim();
      const ctaBtn = ctaSection.find('a, button').first().text().trim();
      components.push({
        id: 'cta-1',
        type: 'CTA',
        props: {
          title: ctaTitle.slice(0, 60) || 'Ready to get started?',
          buttonLabel: ctaBtn.slice(0, 30) || 'Get Started',
        },
      });
    }

    const footer = $('footer').first();
    if (footer.length) {
      const brand = footer.find('a').first().text().trim() || title.slice(0, 20);
      components.push({ id: 'footer-1', type: 'Footer', props: { brand } });
    }

    if (components.length < 2) {
      return this.getDefaultSpec(title, url);
    }

    const page: PageSpec = {
      id: 'home',
      name: 'Home',
      path: '/',
      components,
    };

    return {
      version: '1.0',
      name: title.slice(0, 50),
      description: `Imported from ${url}`,
      pages: [page],
      dataModels: [],
      apis: [],
      realtime: [],
      integrations: [],
      ui: { theme: 'light', primaryColor: '#3b82f6' },
      generatedAt: new Date().toISOString(),
    };
  }

  private getDefaultSpec(title: string, url: string): AppSpec {
    return {
      version: '1.0',
      name: title.slice(0, 50) || 'Imported Page',
      description: `Imported from ${url}`,
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          components: [
            { id: 'nav-1', type: 'Navbar', props: { title: title.slice(0, 20), ctaLabel: 'Get Started' } },
            {
              id: 'hero-1',
              type: 'Hero',
              props: { title: title || 'Welcome', subtitle: `Content from ${url}`, ctaLabel: 'Learn More' },
            },
            {
              id: 'fg-1',
              type: 'FeatureGrid',
              props: { title: 'Features', columns: 3 },
              children: [
                { id: 'fc-1', type: 'FeatureCard', props: { icon: '🚀', title: 'Feature 1', description: 'Description.' } },
                { id: 'fc-2', type: 'FeatureCard', props: { icon: '⚡', title: 'Feature 2', description: 'Description.' } },
                { id: 'fc-3', type: 'FeatureCard', props: { icon: '✨', title: 'Feature 3', description: 'Description.' } },
              ],
            },
            { id: 'cta-1', type: 'CTA', props: { title: 'Ready to start?', buttonLabel: 'Get Started' } },
            { id: 'footer-1', type: 'Footer', props: { brand: title.slice(0, 20) } },
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
