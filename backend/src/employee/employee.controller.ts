import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service.js';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() body: any) {
    return this.employeeService.create(body);
  }

  @Get('by-email')
  findByEmail(@Query('email') email: string) {
    return this.employeeService.findByEmail(email);
  }
}
