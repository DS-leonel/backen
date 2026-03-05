import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { Project } from '../projects/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const project = await this.projectsRepository.findOne({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${createTaskDto.projectId} no encontrado`);
    }

    let assignee: Employee | null = null;
    if (createTaskDto.assigneeId) {
      assignee = await this.employeesRepository.findOne({
        where: { id: createTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(
          `Empleado con id ${createTaskDto.assigneeId} no encontrado`,
        );
      }
    }

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      project,
      assignee,
    });

    return this.tasksRepository.save(task);
  }

  findAll() {
    return this.tasksRepository.find({
      relations: { project: true, assignee: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { project: true, assignee: true },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con id ${id} no encontrada`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);

    if (updateTaskDto.projectId) {
      const project = await this.projectsRepository.findOne({
        where: { id: updateTaskDto.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Proyecto con id ${updateTaskDto.projectId} no encontrado`);
      }
      task.project = project;
    }

    if (updateTaskDto.assigneeId !== undefined) {
      const assignee = await this.employeesRepository.findOne({
        where: { id: updateTaskDto.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException(`Empleado con id ${updateTaskDto.assigneeId} no encontrado`);
      }
      task.assignee = assignee;
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    return this.tasksRepository.save(task);
  }
}
