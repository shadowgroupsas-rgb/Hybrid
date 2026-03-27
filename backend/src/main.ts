import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Register AdminJS Adapter globally before NestJS starts
  // This ensures that when AdminModule loads, the adapter is already available
  const AdminJS = await import('adminjs');
  const AdminJSTypeorm = await import('@adminjs/typeorm');

  // Handle default exports for ESM compatibility
  const AdminJSClass = AdminJS.default || AdminJS;
  const { Database, Resource } = AdminJSTypeorm;

  AdminJSClass.registerAdapter({ Database, Resource });
  console.log('AdminJS Adapter registered globally in main.ts');

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend connectivity (Flutter, Local Dev, etc.)
  app.enableCors({
    origin: '*', // Allow all origins for now (adjust for production if needed)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Trust proxy (Nginx, Load Balancer) for secure cookies and correct IP detection
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Allow external connections (e.g. from App Runner load balancer)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
