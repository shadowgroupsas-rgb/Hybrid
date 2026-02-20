import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from '../entities/check-in.entity.js';
import { Office } from '../entities/office.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { CheckInService } from './check-in.service.js';
import { CheckInController } from './check-in.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Office, Employee])],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
