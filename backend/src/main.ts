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

  // Allow external connections (e.g. from App Runner load balancer)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
