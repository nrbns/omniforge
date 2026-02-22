/**
 * JSON layout schema for OmniForge canvas renderer.
 * Maps to ComponentSpec / PageSpec from AppSpec.
 */

export interface LayoutNode {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  children?: LayoutNode[];
}

export interface PageLayout {
  type: 'page';
  id?: string;
  name?: string;
  path?: string;
  children: LayoutNode[];
}

/**
 * Supported component types in the registry.
 * AI/AppSpec should output these types.
 */
export const LAYOUT_COMPONENT_TYPES = [
  'Navbar',
  'Hero',
  'FeatureGrid',
  'FeatureCard',
  'CTA',
  'Footer',
  'Container',
  'Section',
  'Card',
  'Button',
  'Heading',
  'Text',
  'Image',
] as const;

export type LayoutComponentType = (typeof LAYOUT_COMPONENT_TYPES)[number];
