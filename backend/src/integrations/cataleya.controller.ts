import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { ApiKeyGuard } from './api-key.guard';

@Controller('integrations/cataleya')
export class CataleyaController {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
  ) {}

  @Get('attendance')
  @UseGuards(ApiKeyGuard)
  async getAttendance(): Promise<CheckIn[]> {
    return this.checkInRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}
