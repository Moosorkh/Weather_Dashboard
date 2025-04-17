import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Determine the connection URL before super()
    const connectionUrl = process.env.DATABASE_URL || 
      "postgresql://postgres:kdUYRuWwIUaSW51zFVuuNViVzFVLcsSv@metro.proxy.rlwy.net:26739/railway";
    
    super({
      datasources: {
        db: { url: connectionUrl }
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
    
    // Now we can use this.logger
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL environment variable is not set!');
    }
    
    // Log connection info (safely masked)
    const maskedUrl = connectionUrl.replace(
      /postgresql:\/\/([^:]+):([^@]+)@/,
      'postgresql://$1:***@'
    );
    this.logger.log(`Using database URL: ${maskedUrl}`);
    
    // Fix TypeScript error by using proper typing for event name
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Client error: ${e.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database successfully!');
    } catch (error: any) {
      this.logger.error(`Database connection error: ${error.message}`);
      
      // More specific error diagnostics
      if (error.message.includes('authentication')) {
        this.logger.error('Authentication failed. Please check your database credentials.');
        this.logger.error('If using Railway, ensure the DATABASE_URL variable is properly linked.');
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        this.logger.error('Connection refused or timed out. Please check if the database server is running and accessible.');
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}