import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn } from './entities/check-in.entity';
import { Office } from './entities/office.entity';
import { Employee } from './entities/employee.entity';
import { City } from './entities/city.entity';

import { IntegrationsModule } from './integrations/integrations.module';
import { CheckInModule } from './check-in/check-in.module';
import { CityModule } from './city/city.module';
import { EmployeeModule } from './employee/employee.module';
import { NotificationModule } from './notification/notification.module';
import { AdminApiModule } from './admin/admin.module';

// Helper for ESM imports in CommonJS
const adminJsModule = async (): Promise<DynamicModule> => {
  const { AdminModule } = await import('@adminjs/nestjs');
  const { Database, Resource } = await import('@adminjs/typeorm');
  const { default: AdminJS } = await import('adminjs');

  AdminJS.registerAdapter({ Database, Resource });

  return AdminModule.createAdminAsync({
    useFactory: async () => ({
      adminJsOptions: {
        rootPath: '/admin',
        resources: [CheckIn, Office, Employee, City],
        branding: {
          companyName: 'Copower Energy Solutions',
          logo: '/logo-copower.webp',
          theme: {
            colors: {
              primary100: '#00E5FF',
              primary80: '#00B8D4',
              primary60: '#0091EA',
              primary40: '#006064',
              primary20: '#004D40',
              accent: '#FF0055',
              bg: '#0a0a0a',
            },
          },
        },
        dashboard: {
          handler: async () => ({ message: 'Welcome to Copower God\'s Eye System' }),
        },
      },
    }),
  });
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'copower',
      entities: [CheckIn, Office, Employee, City],
      synchronize: true, // Auto-create tables (dev only)
      logging: false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    IntegrationsModule,
    CheckInModule,
    CityModule,
    EmployeeModule,
    NotificationModule,
    AdminApiModule,
    adminJsModule() as unknown as Promise<DynamicModule>, // NestJS typings quirk with async modules
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
