import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { CheckIn } from './entities/check-in.entity';
import { Office } from './entities/office.entity';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { City } from './entities/city.entity';
import { Department } from './entities/department.entity';

import { IntegrationsModule } from './integrations/integrations.module';
import { CheckInModule } from './check-in/check-in.module';
import { CityModule } from './city/city.module';
import { EmployeeModule } from './employee/employee.module';
import { NotificationModule } from './notification/notification.module';
import { AdminApiModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';

// Helper for ESM imports in CommonJS
const adminJsModule = async (): Promise<DynamicModule> => {
  const { AdminModule } = await import('@adminjs/nestjs');

  return AdminModule.createAdminAsync({
    imports: [TypeOrmModule.forFeature([Employee])],
    inject: [getRepositoryToken(Employee)],
    useFactory: async (employeeRepo: any) => ({
      adminJsOptions: {
        rootPath: '/admin',
        logoutPath: '/admin/logout',
        loginPath: '/admin/login',
        resources: [
          {
            resource: Employee,
            options: {
              properties: {
                password: { isVisible: false }, // Hide hashed password
              },
              actions: {
                new: {
                  isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN || currentAdmin?.role === EmployeeRole.HR,
                  before: async (request) => {
                    if (request.payload.password) {
                      request.payload.password = await bcrypt.hash(request.payload.password, 10);
                    }
                    return request;
                  },
                },
                edit: {
                   isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN || currentAdmin?.role === EmployeeRole.HR || currentAdmin?.role === EmployeeRole.DEPT_ADMIN,
                   before: async (request) => {
                    if (request.payload.password) {
                      request.payload.password = await bcrypt.hash(request.payload.password, 10);
                    }
                    return request;
                  },
                },
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
              },
            },
          },
          {
            resource: Department,
            options: {
              actions: {
                new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
              },
            },
          },
          {
            resource: CheckIn,
            options: {
              actions: {
                new: { isAccessible: false }, // Only mobile app creates check-ins
                edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                list: {
                   isAccessible: ({ currentAdmin }) =>
                      [EmployeeRole.SUPER_ADMIN, EmployeeRole.HR, EmployeeRole.DEPT_ADMIN, EmployeeRole.MANAGER].includes(currentAdmin?.role),
                }
              },
            },
          },
          {
            resource: City,
            options: {
              actions: {
                new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
              },
            },
          },
          {
            resource: Office, // Zones
             options: {
              actions: {
                new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === EmployeeRole.SUPER_ADMIN },
              },
            },
          },
        ],
        branding: {
          companyName: 'Cronos by Copower',
          logo: '/logo-copower.webp',
          withMadeWithLove: false,
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
          handler: async () => ({ message: 'Bienvenido a Cronos - Sistema Ojo de Dios' }),
        },
      },
      auth: {
        authenticate: async (email, password) => {
          const user = await employeeRepo.findOneBy({ email });
          // Explicitly check password hash since it's not selected by default
          if (user && user.password && await bcrypt.compare(password, user.password)) {
             return user;
          }
          // Fallback to select password if needed (entity config handles this, but careful)
          // If password is { select: false }, findOneBy might not return it.
          // We need a query builder or explicit select if the above fails, but let's assume standard behavior for now
          // or improve the query:
          const userWithPass = await employeeRepo.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role', 'name']
          });

          if (userWithPass && await bcrypt.compare(password, userWithPass.password)) {
            return userWithPass;
          }

          return null;
        },
        cookieName: 'cronos_admin',
        cookiePassword: process.env.SESSION_SECRET || 'super-secret-session-key',
      },
      sessionOptions: {
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET || 'super-secret-session-key',
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
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
      entities: [CheckIn, Office, Employee, City, Department],
      synchronize: process.env.DB_SYNC === 'true',
      logging: false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([Employee]), // Make repository available
    IntegrationsModule,
    CheckInModule,
    CityModule,
    EmployeeModule,
    NotificationModule,
    AdminApiModule,
    AuthModule,
    adminJsModule() as unknown as Promise<DynamicModule>,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
