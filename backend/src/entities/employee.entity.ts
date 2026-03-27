import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CheckIn } from './check-in.entity.js';
import { Department } from './department.entity.js';

export enum EmployeeStatus {
  WORKING = 'WORKING',
  OFFLINE = 'OFFLINE',
  OVERTIME = 'OVERTIME',
}

export enum EmployeeRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEPT_ADMIN = 'DEPT_ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER', // Gerente/Director Administrativo
  EMPLOYEE = 'EMPLOYEE',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false, nullable: true }) // Password hashed, not selected by default
  password: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.EMPLOYEE,
  })
  role: EmployeeRole;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.OFFLINE,
  })
  status: EmployeeStatus;

  @ManyToOne(() => Department, (dept) => dept.employees, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @OneToMany(() => CheckIn, (checkIn) => checkIn.employee)
  checkIns: CheckIn[];
}
