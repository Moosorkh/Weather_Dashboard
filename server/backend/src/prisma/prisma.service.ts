import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionUrl = process.env.DATABASE_URL;

    if (!connectionUrl) {
      throw new Error("DATABASE_URL environment variable is not set!");
    }

    super({
      datasources: {
        db: { url: connectionUrl },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });

    const maskedUrl = connectionUrl.replace(/postgresql:\/\/([^:]+):([^@]+)@/, 'postgresql://$1:***@');
    this.logger.log(`Using database URL: ${maskedUrl}`);

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
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}