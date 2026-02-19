import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import * as QRCode from 'qrcode';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: any) {
    // Force cast to unknown then City to avoid TS error, assuming createCityDto results in a single entity
    const city = this.cityRepository.create(createCityDto) as unknown as City;

    // Explicit generation
    const uniquePayload = `copower:city:${Date.now()}`;
    city.qrCodeData = await QRCode.toDataURL(uniquePayload);

    return this.cityRepository.save(city);
  }

  findAll() {
    return this.cityRepository.find();
  }

  findOne(id: number) {
    return this.cityRepository.findOneBy({ id });
  }
}
