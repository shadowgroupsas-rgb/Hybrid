import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity.js';

export enum CheckInType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity()
export class CheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  employeeId: string; // Keeping this for backward compat or direct reference

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

  @Column({ default: false })
  isNightOvertime: boolean;

  @Column({ nullable: true })
  dayOfWeek: string;

  @Column({ type: 'text', nullable: true })
  activityDescription: string;

  @ManyToOne(() => Employee, (employee) => employee.checkIns, { nullable: true })
  employee: Employee;
}
