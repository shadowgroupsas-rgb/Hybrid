import { DataSource } from 'typeorm';
import { Employee, EmployeeStatus } from './entities/employee.entity.js';
import { City } from './entities/city.entity.js';
import { CheckIn } from './entities/check-in.entity.js';
import { Office } from './entities/office.entity.js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as QRCode from 'qrcode';

// Load environment variables
dotenv.config({ path: '../.env' }); // Adjust path as needed

// Create a new DataSource configuration for seeding
// Note: Entities are imported directly from the files
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'copower',
  entities: [Employee, City, CheckIn, Office], // Include ALL entities to resolve relations
  synchronize: false, // Do not sync schema here, assume app has run
});

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const employeeRepo = AppDataSource.getRepository(Employee);
    const cityRepo = AppDataSource.getRepository(City);

    // 1. Seed Initial Admin / Super User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@copower.com';
    const existingAdmin = await employeeRepo.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      console.log(`Creating Super Admin: ${adminEmail}`);
      const admin = employeeRepo.create({
        email: adminEmail,
        name: 'Super Admin',
        status: EmployeeStatus.OFFLINE,
      });
      await employeeRepo.save(admin);
      console.log('Super Admin created successfully.');
    } else {
      console.log('Super Admin already exists.');
    }

    // 2. Seed Initial Cities (Example)
    const citiesToSeed = [
      { name: 'Cartagena', duration: 20 },
      { name: 'Bogota', duration: 30 },
    ];

    for (const cityData of citiesToSeed) {
      const existingCity = await cityRepo.findOneBy({ name: cityData.name });
      if (!existingCity) {
        console.log(`Creating City: ${cityData.name}`);
        const city = cityRepo.create({
          name: cityData.name,
          postShiftTrackingDuration: cityData.duration,
        });

        // Save first to get ID
        const savedCity = await cityRepo.save(city);

        // Generate QR code if not present
        if (!savedCity.qrCodeData) {
            const uniquePayload = `copower:city:${savedCity.id}`;
            savedCity.qrCodeData = await QRCode.toDataURL(uniquePayload);
            await cityRepo.save(savedCity);
        }
        console.log(`City ${cityData.name} created.`);
      } else {
         console.log(`City ${cityData.name} already exists.`);
      }
    }

    console.log('Seeding complete.');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

bootstrap();
