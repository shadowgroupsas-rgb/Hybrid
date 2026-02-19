import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { Office } from '../entities/office.entity';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    @InjectRepository(Office)
    private officeRepository: Repository<Office>,
  ) {}

  async create(data: any): Promise<CheckIn> {
    const { employeeId, type, latitude, longitude } = data;

    // Check if within any office radius
    // PostGIS ST_DWithin(geometry, geometry, distance_in_meters)
    // We need to construct a point from lat/lon
    // Assuming SRID 4326 (WGS84) for lat/lon

    // Find offices where distance is within radius
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

    const checkIn = this.checkInRepository.create({
      employeeId,
      type,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      isRemote,
    });

    return this.checkInRepository.save(checkIn);
  }
}
