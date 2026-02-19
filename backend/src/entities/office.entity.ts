import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Office {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: object;

  @Column({ type: 'float', default: 100 }) // Radius in meters
  radius: number;
}
