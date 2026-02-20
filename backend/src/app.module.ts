import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/typeorm';

import { CheckIn } from './entities/check-in.entity.js';
import { Office } from './entities/office.entity.js';
import { Employee } from './entities/employee.entity.js';
import { City } from './entities/city.entity.js';

import { IntegrationsModule } from './integrations/integrations.module.js';
import { CheckInModule } from './check-in/check-in.module.js';
import { CityModule } from './city/city.module.js';
import { EmployeeModule } from './employee/employee.module.js';
import { NotificationModule } from './notification/notification.module.js';

// Explicitly register the adapter here for ESM
AdminJS.registerAdapter({ Database, Resource });

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
    }),
    AdminModule.createAdmin({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [CheckIn, Office, Employee, City],
          branding: {
            companyName: 'Copower Energy Solutions',
            logo: '/logo-copower.webp',
            theme: {
              colors: {
                primary100: '#1976D2',
                primary80: '#1565C0',
                primary60: '#0D47A1',
                primary40: '#002171',
                primary20: '#5472d3',
                accent: '#D32F2F',
                hoverBg: '#1E1E1E',
              },
            },
          },
          dashboard: {
            handler: async () => {
              return { message: 'Welcome to Copower God\'s Eye System' };
            },
          }
        },
    }),
    IntegrationsModule,
    CheckInModule,
    CityModule,
    EmployeeModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
