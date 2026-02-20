import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service.js';
import { CityController } from './city.controller.js';
import { City } from '../entities/city.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
