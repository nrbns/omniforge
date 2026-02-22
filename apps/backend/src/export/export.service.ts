import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Export products to Shopify format
   */
  async exportToShopify(
    businessId: string,
    shopifyApiKey?: string,
    shopifyStore?: string
  ): Promise<any> {
    // Get products from database
    const products = await this.prisma.$queryRaw`
      SELECT * FROM "Product"
      WHERE "businessId" = ${businessId}
    `.catch(() => []);

    if (!shopifyApiKey || !shopifyStore) {
      // Return Shopify-compatible JSON format
      return {
        format: 'shopify',
        products: (products as any[]).map((p) => ({
          title: p.name,
          body_html: p.description || '',
          vendor: p.vendor || 'OmniForge',
          product_type: p.category || '',
          variants: [
            {
              price: p.price?.toString() || '0',
              sku: p.sku || '',
              inventory_quantity: p.stock || 0,
            },
          ],
          images: p.imageUrl ? [{ src: p.imageUrl }] : [],
        })),
      };
    }

    // If API key provided, push to Shopify
    try {
      const shopifyProducts = (products as any[]).map((p) => ({
        product: {
          title: p.name,
          body_html: p.description || '',
          vendor: p.vendor || 'OmniForge',
          product_type: p.category || '',
          variants: [
            {
              price: p.price?.toString() || '0',
              sku: p.sku || '',
              inventory_quantity: p.stock || 0,
            },
          ],
          images: p.imageUrl ? [{ src: p.imageUrl }] : [],
        },
      }));

      // Push to Shopify API
      const results = [];
      for (const product of shopifyProducts) {
        const response = await axios.post(
          `https://${shopifyStore}.myshopify.com/admin/api/2024-01/products.json`,
          product,
          {
            headers: {
              'X-Shopify-Access-Token': shopifyApiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        results.push(response.data);
      }

      return { success: true, exported: results.length, results };
    } catch (error) {
      this.logger.error('Failed to export to Shopify:', error);
      throw new Error('Failed to export to Shopify');
    }
  }

  /**
   * Export contacts to HubSpot format
   */
  async exportToHubSpot(businessId: string, hubspotApiKey?: string): Promise<any> {
    // Get contacts from database
    const contacts = await this.prisma.$queryRaw`
      SELECT * FROM "Contact"
      WHERE "businessId" = ${businessId}
    `.catch(() => []);

    if (!hubspotApiKey) {
      // Return HubSpot-compatible JSON format
      return {
        format: 'hubspot',
        contacts: (contacts as any[]).map((c) => ({
          email: c.email,
          firstname: c.firstName || '',
          lastname: c.lastName || '',
          phone: c.phone || '',
          company: c.company || '',
          website: c.website || '',
        })),
      };
    }

    // If API key provided, push to HubSpot
    try {
      const hubspotContacts = (contacts as any[]).map((c) => ({
        properties: {
          email: c.email,
          firstname: c.firstName || '',
          lastname: c.lastName || '',
          phone: c.phone || '',
          company: c.company || '',
          website: c.website || '',
        },
      }));

      // Push to HubSpot API
      const results = [];
      for (const contact of hubspotContacts) {
        const response = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          contact,
          {
            headers: {
              Authorization: `Bearer ${hubspotApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        results.push(response.data);
      }

      return { success: true, exported: results.length, results };
    } catch (error) {
      this.logger.error('Failed to export to HubSpot:', error);
      throw new Error('Failed to export to HubSpot');
    }
  }

  /**
   * Export to CSV
   */
  async exportToCSV(businessId: string, type: 'products' | 'contacts' | 'orders'): Promise<string> {
    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'products':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Product"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        headers = ['id', 'name', 'description', 'price', 'stock', 'category', 'sku', 'imageUrl'];
        break;

      case 'contacts':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Contact"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        headers = ['id', 'email', 'firstName', 'lastName', 'phone', 'company', 'website'];
        break;

      case 'orders':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Order"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        headers = ['id', 'amount', 'status', 'createdAt', 'customerEmail'];
        break;
    }

    // Convert to CSV
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map((h) => {
        const value = row[h];
        return value !== null && value !== undefined
          ? `"${String(value).replace(/"/g, '""')}"`
          : '';
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Export to JSON
   */
  async exportToJSON(businessId: string, type: 'products' | 'contacts' | 'orders'): Promise<any> {
    let data: any[] = [];

    switch (type) {
      case 'products':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Product"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        break;

      case 'contacts':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Contact"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        break;

      case 'orders':
        data = (await this.prisma.$queryRaw`
          SELECT * FROM "Order"
          WHERE "businessId" = ${businessId}
        `.catch(() => [])) as any[];
        break;
    }

    return { type, count: data.length, data };
  }
}
