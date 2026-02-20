import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CheckIn } from './check-in.entity.js';

export enum EmployeeStatus {
  WORKING = 'WORKING',
  OFFLINE = 'OFFLINE',
  OVERTIME = 'OVERTIME',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.OFFLINE,
  })
  status: EmployeeStatus;

  @OneToMany(() => CheckIn, (checkIn) => checkIn.employee)
  checkIns: CheckIn[];
}
