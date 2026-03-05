import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from '../departments/department.entity';
import { Task } from '../tasks/task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @ManyToOne(() => Department, (department) => department.projects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  department: Department;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
