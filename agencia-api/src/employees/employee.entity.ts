import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from '../departments/department.entity';
import { Task } from '../tasks/task.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @ManyToOne(() => Department, (department) => department.employees, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  department: Department;

  @OneToMany(() => Task, (task) => task.assignee)
  tasks: Task[];
}
