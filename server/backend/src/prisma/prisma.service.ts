import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Connected to database successfully');
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
      // Log the full error details for debugging
      console.error(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}