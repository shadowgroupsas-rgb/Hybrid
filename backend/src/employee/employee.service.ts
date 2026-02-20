import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../entities/employee.entity.js';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(data: Partial<Employee>) {
    const employee = this.employeeRepository.create(data);
    return this.employeeRepository.save(employee);
  }

  async findByEmail(email: string) {
    return this.employeeRepository.findOneBy({ email });
  }

  async updateStatus(id: number, status: EmployeeStatus) {
    await this.employeeRepository.update(id, { status });
  }
}
