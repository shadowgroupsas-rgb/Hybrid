import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { Office } from '../entities/office.entity';
import { Employee } from '../entities/employee.entity';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Office, Employee])],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
