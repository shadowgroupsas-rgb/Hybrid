import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CheckInService } from './check-in.service.js';
import { CreateCheckInDto } from './create-check-in.dto.js';
import { FirebaseAuthGuard } from './firebase-auth.guard.js'; // Import the guard

@Controller('check-ins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard) // Protect this endpoint
  create(@Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInService.create(createCheckInDto);
  }
}
