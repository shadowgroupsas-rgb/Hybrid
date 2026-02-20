import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn, CheckInType } from '../entities/check-in.entity.js';
import { Office } from '../entities/office.entity.js';
import { Employee, EmployeeStatus } from '../entities/employee.entity.js';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    @InjectRepository(Office)
    private officeRepository: Repository<Office>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(data: any): Promise<CheckIn> {
    const { employeeId, type, latitude, longitude, email } = data;
    const now = new Date();

    // 1. Resolve Employee
    let employee: Employee | null = null;
    if (email) {
      employee = await this.employeeRepository.findOneBy({ email });
    }

    // 2. Geofencing Logic
    const offices = await this.officeRepository
      .createQueryBuilder('office')
      .where(
        `ST_DWithin(
          office.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          office.radius
        )`,
        { longitude, latitude }
      )
      .getMany();

    const isRemote = offices.length === 0;

    // 3. Night Overtime Logic (19:00 - 06:00)
    const hour = now.getHours();
    const isNightOvertime = hour >= 19 || hour < 6;

    // 4. Day of Week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];

    const checkIn = this.checkInRepository.create({
      employeeId, // Keep for legacy
      employee: employee || undefined,
      timestamp: now,
      type,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      isRemote: isRemote,
      isNightOvertime: isNightOvertime,
      dayOfWeek: dayOfWeek,
    });

    const savedCheckIn = await this.checkInRepository.save(checkIn);

    // 5. Update Employee Status
    if (employee) {
      if (type === CheckInType.IN) {
        employee.status = isNightOvertime ? EmployeeStatus.OVERTIME : EmployeeStatus.WORKING;
      } else {
        employee.status = EmployeeStatus.OFFLINE;
      }
      await this.employeeRepository.save(employee);
    }

    return savedCheckIn;
  }
}
