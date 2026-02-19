import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@adminjs/nestjs';

import { CheckIn } from './entities/check-in.entity';
import { Office } from './entities/office.entity';
import { IntegrationsModule } from './integrations/integrations.module';
import { CheckInModule } from './check-in/check-in.module';

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
      entities: [CheckIn, Office],
      synchronize: true, // Auto-create tables (dev only)
      logging: false,
    }),
    // TypeOrmModule.forFeature([CheckIn]), // Removed from here as it's in CheckInModule
    AdminModule.createAdminAsync({
      useFactory: async () => {
        const AdminJS = await import('adminjs');
        const AdminJSTypeorm = await import('@adminjs/typeorm');
        AdminJS.default.registerAdapter({
          Database: AdminJSTypeorm.Database,
          Resource: AdminJSTypeorm.Resource,
        });
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [CheckIn, Office],
          },
        };
      },
    }),
    IntegrationsModule,
    CheckInModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
