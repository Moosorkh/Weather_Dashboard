import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure CORS
  app.enableCors();
  
  // Set global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Serve static files from the public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Make sure the health endpoint is NOT prefixed with /api
  app.use('/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
  });
  
  // For SPA routing, serve index.html for any non-API and non-health routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && req.path !== '/health') {
      return res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    }
    next();
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();