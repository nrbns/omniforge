'use client';

import { Canvas, appSpecToSingleLayout } from '@omniforge/editor';

/**
 * Canvas Preview - Prompt → JSON layout → Live render
 * Demo page showing the OmniForge JSON renderer with sample AppSpec.
 */
export default function CanvasPreviewPage() {
  const sampleSpec = {
    version: '1.0',
    name: 'Food Delivery App',
    description: 'A food delivery app built with OmniForge',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [
          {
            id: 'nav-1',
            type: 'Navbar',
            props: {
              title: 'FoodDelivery',
              ctaLabel: 'Order Now',
              links: [
                { label: 'Menu', href: '#menu' },
                { label: 'About', href: '#about' },
                { label: 'Contact', href: '#contact' },
              ],
            },
          },
          {
            id: 'hero-1',
            type: 'Hero',
            props: {
              title: 'Your favorite meals, delivered.',
              subtitle:
                'Order from the best restaurants in town. Fast delivery, fresh food.',
              ctaLabel: 'Order Now',
              ctaSecondaryLabel: 'View Menu',
            },
          },
          {
            id: 'features-1',
            type: 'FeatureGrid',
            props: {
              title: 'Why choose us',
              subtitle: 'The easiest way to order food online',
              columns: 3,
            },
            children: [
              {
                id: 'fc-1',
                type: 'FeatureCard',
                props: {
                  icon: '🚀',
                  title: 'Fast delivery',
                  description: 'Get your food in 30 minutes or less.',
                },
              },
              {
                id: 'fc-2',
                type: 'FeatureCard',
                props: {
                  icon: '🍕',
                  title: 'Fresh ingredients',
                  description: 'Quality meals from top restaurants.',
                },
              },
              {
                id: 'fc-3',
                type: 'FeatureCard',
                props: {
                  icon: '💳',
                  title: 'Easy payment',
                  description: 'Pay securely with card or wallet.',
                },
              },
            ],
          },
          {
            id: 'cta-1',
            type: 'CTA',
            props: {
              title: 'Ready to order?',
              subtitle: 'Download our app and get 20% off your first order.',
              buttonLabel: 'Get the App',
            },
          },
          {
            id: 'footer-1',
            type: 'Footer',
            props: { brand: 'FoodDelivery' },
          },
        ],
      },
    ],
    dataModels: [],
    apis: [],
    realtime: [],
    integrations: [],
    ui: { theme: 'light', primaryColor: '#3b82f6' },
    generatedAt: new Date().toISOString(),
  } as any;

  const layout = appSpecToSingleLayout(sampleSpec);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">OmniForge Canvas Preview</h1>
        <p className="text-sm text-gray-500">
          Prompt → JSON layout → Live render
        </p>
      </header>
      <main className="p-4">
        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white">
          <Canvas layout={layout} />
        </div>
      </main>
    </div>
  );
}
