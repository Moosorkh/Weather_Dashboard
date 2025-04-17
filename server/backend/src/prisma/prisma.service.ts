import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Use environment variable with fallback
    const url = process.env.DATABASE_URL || 
      "postgresql://postgres:kdUYRuWwIUaSW51zFVuuNViVzFVLcsSv@metro.proxy.rlwy.net:26739/railway";
    
    super({
      datasources: {
        db: { url }
      },
    });
    
    console.log("Using database URL:", url.substring(0, 30) + "...");
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Connected to database successfully!');
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}