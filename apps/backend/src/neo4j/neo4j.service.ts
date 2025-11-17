import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'omniforge_dev'
      )
    );
  }

  async onModuleInit() {
    try {
      await this.driver.verifyConnectivity();
      console.log('✅ Neo4j connected');
    } catch (error) {
      console.error('❌ Neo4j connection error:', error);
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  getDriver(): Driver {
    return this.driver;
  }

  getSession(): Session {
    return this.driver.session();
  }

  async runQuery<T = any>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  /**
   * Run a Cypher query and return records
   */
  async run(query: string, params: Record<string, any> = {}): Promise<any[]> {
    return this.runQuery(query, params);
  }
}
