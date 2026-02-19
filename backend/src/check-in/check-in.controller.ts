import { Controller, Post, Body } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './create-check-in.dto';

@Controller('check-ins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  create(@Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInService.create(createCheckInDto);
  }
}
