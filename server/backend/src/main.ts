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
  
  // For SPA routing, serve index.html for any non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      return res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    }
    next();
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();