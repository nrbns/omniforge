import type { AppSpec, PageSpec, ComponentSpec } from '@omniforge/shared';
import type { LayoutNode, PageLayout } from '../schema';

/**
 * Map ComponentSpec type to a layout-friendly type name.
 * Handles common variations from AI/spec output.
 */
function normalizeComponentType(type: string): string {
  const mapping: Record<string, string> = {
    navbar: 'Navbar',
    nav: 'Navbar',
    header: 'Navbar',
    hero: 'Hero',
    features: 'FeatureGrid',
    featuregrid: 'FeatureGrid',
    feature_grid: 'FeatureGrid',
    featurecard: 'FeatureCard',
    feature_card: 'FeatureCard',
    cta: 'CTA',
    call_to_action: 'CTA',
    calltoaction: 'CTA',
    footer: 'Footer',
    container: 'Container',
    section: 'Section',
    card: 'Card',
    button: 'Button',
    heading: 'Heading',
    text: 'Text',
    image: 'Image',
  };
  const normalized = mapping[type.toLowerCase().replace(/\s/g, '')];
  return normalized || type;
}

function componentSpecToLayoutNode(spec: ComponentSpec): LayoutNode {
  const type = normalizeComponentType(spec.type);
  const node: LayoutNode = {
    id: spec.id,
    type,
    props: spec.props || {},
  };
  if (spec.children?.length) {
    node.children = spec.children.map(componentSpecToLayoutNode);
  }
  return node;
}

/**
 * Map a single PageSpec to a PageLayout (JSON layout for renderer).
 */
export function pageSpecToLayout(page: PageSpec, appName?: string): PageLayout {
  const children: LayoutNode[] = [];

  if (page.components?.length) {
    for (const comp of page.components) {
      children.push(componentSpecToLayoutNode(comp));
    }
  }

  if (children.length === 0) {
    children.push(
      {
        type: 'Navbar',
        props: { title: appName || page.name },
      },
      {
        type: 'Hero',
        props: {
          title: page.name,
          subtitle: `Welcome to ${page.name}`,
          ctaLabel: 'Get Started',
        },
      },
      {
        type: 'FeatureGrid',
        props: {
          title: 'Features',
          subtitle: 'Key features of your application',
          columns: 3,
        },
        children: [
          {
            type: 'FeatureCard',
            props: {
              icon: '⚡',
              title: 'Fast',
              description: 'Lightning fast performance.',
            },
          },
          {
            type: 'FeatureCard',
            props: {
              icon: '🔒',
              title: 'Secure',
              description: 'Enterprise-grade security.',
            },
          },
          {
            type: 'FeatureCard',
            props: {
              icon: '📦',
              title: 'Scalable',
              description: 'Grows with your business.',
            },
          },
        ],
      },
      {
        type: 'CTA',
        props: {
          title: 'Ready to get started?',
          buttonLabel: 'Start Building',
        },
      },
      {
        type: 'Footer',
        props: { brand: appName || 'App' },
      }
    );
  }

  return {
    type: 'page',
    id: page.id,
    name: page.name,
    path: page.path,
    children,
  };
}

/**
 * Map AppSpec to an array of PageLayout (one per page).
 */
export function appSpecToLayouts(spec: AppSpec): PageLayout[] {
  const pages = spec.pages || [];
  if (pages.length === 0) {
    return [
      pageSpecToLayout(
        { id: 'home', name: 'Home', path: '/', components: [] },
        spec.name
      ),
    ];
  }
  return pages.map((page) => pageSpecToLayout(page, spec.name));
}

/**
 * Map AppSpec to a single layout (first page, or home).
 * Useful for canvas preview when showing one page at a time.
 */
export function appSpecToSingleLayout(spec: AppSpec): PageLayout {
  const layouts = appSpecToLayouts(spec);
  return layouts[0] || pageSpecToLayout({ id: 'home', name: 'Home', path: '/', components: [] }, spec.name);
}
