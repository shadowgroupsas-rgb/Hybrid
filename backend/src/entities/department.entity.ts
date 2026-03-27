import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity.js';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => Employee, { nullable: true })
  @JoinColumn()
  manager: Employee;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
