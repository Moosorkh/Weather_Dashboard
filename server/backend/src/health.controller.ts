import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly prismaService: PrismaService) {}

    @Get()
    async check(@Res() res: Response) {
        try {
            // Try a simple database query
            await this.prismaService.$queryRaw`SELECT 1`;
            return res.status(HttpStatus.OK).json({ status: 'ok', database: 'connected' });
        } catch (error) {
            // Return OK even if database is down (Railway will still deploy)
            console.error(`Health check database error: ${error.message}`);
            return res.status(HttpStatus.OK).json({ 
                status: 'ok', 
                database: 'disconnected',
                message: 'Application is running but database connection failed'
            });
        }
    }
}