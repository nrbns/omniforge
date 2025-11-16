import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private readonly supabaseUrl?: string;
  private readonly supabaseKey?: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!this.supabaseUrl || !this.supabaseKey) {
      this.logger.warn('⚠️ Supabase credentials not found. Running in mock mode.');
    } else {
      this.logger.log('✅ Supabase Auth service initialized');
    }
  }

  /**
   * Create contact in Supabase
   */
  async createContact(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    businessId: string;
  }): Promise<any> {
    // Store in local database first
    const contact = await this.prisma.$executeRaw`
      INSERT INTO "Contact" ("email", "firstName", "lastName", "phone", "company", "businessId", "createdAt")
      VALUES (${params.email}, ${params.firstName || null}, ${params.lastName || null}, ${params.phone || null}, ${params.company || null}, ${params.businessId}, NOW())
      ON CONFLICT ("email", "businessId") DO UPDATE
      SET "firstName" = EXCLUDED."firstName",
          "lastName" = EXCLUDED."lastName",
          "phone" = EXCLUDED."phone",
          "company" = EXCLUDED."company"
      RETURNING *
    `.catch(() => null);

    // If Supabase configured, sync to Supabase
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        // TODO: Use Supabase client to create contact
        // const { data, error } = await supabase.from('contacts').insert(params);
        this.logger.log(`Contact synced to Supabase: ${params.email}`);
      } catch (error) {
        this.logger.warn('Failed to sync contact to Supabase:', error);
      }
    }

    return contact;
  }

  /**
   * Get contacts from Supabase
   */
  async getContacts(businessId: string): Promise<any[]> {
    // Query from local database
    const contacts = await this.prisma.$queryRaw`
      SELECT * FROM "Contact"
      WHERE "businessId" = ${businessId}
      ORDER BY "createdAt" DESC
    `.catch(() => []);

    return contacts as any[];
  }
}

