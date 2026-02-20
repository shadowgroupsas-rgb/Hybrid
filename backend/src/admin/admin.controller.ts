import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../entities/employee.entity';

@Controller('admin-api')
export class AdminController {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  @Get('stats')
  async getStats() {
    const active = await this.employeeRepository.find({
      where: { status: EmployeeStatus.WORKING },
      relations: ['checkIns'],
    });

    const overtime = await this.employeeRepository.find({
      where: { status: EmployeeStatus.OVERTIME },
    });

    return {
      activeEmployees: active.map(e => ({
        name: e.name,
        status: e.status,
        // Get last check-in location or default
        lastCheckIn: e.checkIns && e.checkIns.length > 0
          ? e.checkIns[e.checkIns.length - 1].timestamp
          : 'N/A'
      })),
      overtimeEmployees: overtime.map(e => ({
        name: e.name,
        status: e.status,
        hours: 'Calculating...' // Placeholder for calc logic
      })),
      totalActive: active.length,
      totalOvertime: overtime.length,
    };
  }
}
