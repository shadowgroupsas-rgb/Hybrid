import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum CheckInType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity()
export class CheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: object;

  @Column({
    type: 'enum',
    enum: CheckInType,
  })
  type: CheckInType;

  @Column({ default: false })
  isRemote: boolean;
}
