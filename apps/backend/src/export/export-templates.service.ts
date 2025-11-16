import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Export Templates Service
 * One-click export to Figma, Shopify, and other platforms
 */
@Injectable()
export class ExportTemplatesService {
  private readonly logger = new Logger(ExportTemplatesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Export design tokens to Figma format
   */
  async exportToFigma(businessId: string, figmaApiKey?: string, figmaFileKey?: string): Promise<any> {
    // Get design tokens from database
    const tokens = await this.prisma.designToken.findMany({
      where: { project: { businessId } },
    });

    // Convert to Figma variables format
    const figmaVariables = {
      version: '1.0',
      collections: [
        {
          name: 'OmniForge Design Tokens',
          modes: [{ name: 'Default' }],
          variables: tokens.map((token) => ({
            name: token.key.replace(/\./g, '/'),
            type: this.inferFigmaType(token.value),
            valuesByMode: {
              Default: this.convertValue(token.value),
            },
          })),
        },
      ],
    };

    if (!figmaApiKey || !figmaFileKey) {
      // Return Figma-compatible JSON
      return {
        format: 'figma-variables',
        variables: figmaVariables,
        instructions: 'Import this JSON into Figma via Variables API or Plugin',
      };
    }

    // If API key provided, push to Figma
    try {
      // TODO: Implement Figma API push
      // const response = await axios.post(
      //   `https://api.figma.com/v1/files/${figmaFileKey}/variables`,
      //   figmaVariables,
      //   { headers: { 'X-Figma-Token': figmaApiKey } }
      // );
      this.logger.log('Figma export ready (API push not yet implemented)');
      return { success: true, variables: figmaVariables };
    } catch (error) {
      this.logger.error('Failed to export to Figma:', error);
      throw new Error('Failed to export to Figma');
    }
  }

  /**
   * Export products to Shopify template format
   */
  async exportProductsToShopifyTemplate(businessId: string): Promise<string> {
    const products = await this.prisma.$queryRaw`
      SELECT * FROM "Product"
      WHERE "businessId" = ${businessId}
    `.catch(() => []);

    // Generate Shopify Liquid template
    const liquidTemplate = `{% comment %}
  OmniForge Generated Shopify Template
  Products: ${(products as any[]).length}
{% endcomment %}

<div class="product-grid">
  {% for product in collections.all.products limit: 20 %}
    <div class="product-card">
      <a href="{{ product.url }}">
        <img src="{{ product.featured_image | img_url: 'large' }}" alt="{{ product.title }}">
        <h3>{{ product.title }}</h3>
        <p class="price">{{ product.price | money }}</p>
        <button class="add-to-cart" data-product-id="{{ product.id }}">
          Add to Cart
        </button>
      </a>
    </div>
  {% endfor %}
</div>

<style>
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    padding: 2rem;
  }
  .product-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .product-card h3 {
    padding: 1rem;
    margin: 0;
    font-size: 1.125rem;
  }
  .price {
    padding: 0 1rem;
    font-weight: bold;
    color: #059669;
  }
  .add-to-cart {
    width: 100%;
    padding: 0.75rem;
    background: #7c3aed;
    color: white;
    border: none;
    border-radius: 0 0 8px 8px;
    cursor: pointer;
  }
</style>`;

    return liquidTemplate;
  }

  /**
   * Export to Next.js template
   */
  async exportToNextJSTemplate(businessId: string): Promise<any> {
    const products = await this.prisma.$queryRaw`
      SELECT * FROM "Product"
      WHERE "businessId" = ${businessId}
    `.catch(() => []);

    return {
      format: 'nextjs',
      pages: [
        {
          path: 'app/products/page.tsx',
          content: this.generateNextJSProductsPage(products as any[]),
        },
        {
          path: 'app/products/[id]/page.tsx',
          content: this.generateNextJSProductDetailPage(),
        },
      ],
      components: [
        {
          path: 'components/ProductCard.tsx',
          content: this.generateProductCardComponent(),
        },
      ],
    };
  }

  /**
   * Export to React template
   */
  async exportToReactTemplate(businessId: string): Promise<any> {
    return {
      format: 'react',
      components: [
        {
          path: 'src/components/ProductList.jsx',
          content: this.generateReactProductList(),
        },
      ],
    };
  }

  private inferFigmaType(value: string): string {
    if (value.startsWith('#')) return 'COLOR';
    if (value.includes('px') || value.includes('rem')) return 'FLOAT';
    if (/^\d+$/.test(value)) return 'FLOAT';
    return 'STRING';
  }

  private convertValue(value: string): any {
    if (value.startsWith('#')) {
      // Convert hex to RGB
      const hex = value.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return { r, g, b, a: 1 };
    }
    if (value.includes('px')) {
      return parseFloat(value.replace('px', ''));
    }
    if (value.includes('rem')) {
      return parseFloat(value.replace('rem', '')) * 16;
    }
    return value;
  }

  private generateNextJSProductsPage(products: any[]): string {
    return `'use client';

import { ProductCard } from '@/components/ProductCard';

export default function ProductsPage() {
  const products = ${JSON.stringify(products, null, 2)};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
`;
  }

  private generateNextJSProductDetailPage(): string {
    return `'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch product by ID
    fetch(\`/api/products/\${params.id}\`)
      .then((res) => res.json())
      .then(setProduct);
  }, [params.id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={product.imageUrl} alt={product.name} className="rounded-lg" />
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl text-green-600 font-bold mb-4">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
`;
  }

  private generateProductCardComponent(): string {
    return `'use client';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-green-600 font-bold mb-4">${product.price}</p>
        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
`;
  }

  private generateReactProductList(): string {
    return `import React, { useState, useEffect } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.imageUrl} alt={product.name} />
          <h3>{product.name}</h3>
          <p className="price">${product.price}</p>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
`;
  }
}

