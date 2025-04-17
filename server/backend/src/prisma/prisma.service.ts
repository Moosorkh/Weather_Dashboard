import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        // Get DATABASE_URL from environment or use a fallback for debugging
        const url = process.env.DATABASE_URL;
        
        if (!url) {
            console.error('DATABASE_URL not found in environment variables!');
        }
        
        super({
            datasources: {
                db: {
                    url: url || 'postgresql://postgres:postgres@localhost:5432/postgres',
                },
            },
        });
    }

    async onModuleInit() {
        try {
            this.logger.log('Connecting to database...');
            await this.$connect();
            this.logger.log('Connected to database successfully');
        } catch (error) {
            this.logger.error(`Failed to connect to database: ${error.message}`);
            // Don't throw the error, let the app continue
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}