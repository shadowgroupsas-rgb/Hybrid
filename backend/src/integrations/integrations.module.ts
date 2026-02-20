import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from '../entities/check-in.entity.js';
import { CataleyaController } from './cataleya.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn])],
  controllers: [CataleyaController],
})
export class IntegrationsModule {}
