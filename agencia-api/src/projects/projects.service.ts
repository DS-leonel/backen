import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from '../common/enums/task-status.enum';
import { Department } from '../departments/department.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const department = await this.departmentsRepository.findOne({
      where: { id: createProjectDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Departamento con id ${createProjectDto.departmentId} no encontrado`,
      );
    }

    const project = this.projectsRepository.create({
      name: createProjectDto.name,
      startDate: createProjectDto.startDate,
      department,
    });

    return this.projectsRepository.save(project);
  }

  findAll() {
    return this.projectsRepository.find({
      relations: { department: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: { department: true },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);

    if (updateProjectDto.departmentId) {
      const department = await this.departmentsRepository.findOne({
        where: { id: updateProjectDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Departamento con id ${updateProjectDto.departmentId} no encontrado`,
        );
      }
      project.department = department;
    }

    if (updateProjectDto.name !== undefined) {
      project.name = updateProjectDto.name;
    }
    if (updateProjectDto.startDate !== undefined) {
      project.startDate = updateProjectDto.startDate;
    }

    return this.projectsRepository.save(project);
  }

  async getProjectDetail(id: number) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: {
        department: true,
        tasks: {
          assignee: true,
        },
      },
      order: {
        tasks: {
          id: 'ASC',
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }

    const totalTasks = project.tasks?.length ?? 0;
    const completedTasks =
      project.tasks?.filter((task) => task.status === TaskStatus.COMPLETED).length ?? 0;

    // Cálculo automático del avance del proyecto según tareas completadas.
    const progressPercentage = totalTasks === 0 ? 0 : Number(((completedTasks / totalTasks) * 100).toFixed(2));

    return {
      id: project.id,
      name: project.name,
      startDate: project.startDate,
      department: project.department,
      totalTasks,
      completedTasks,
      progressPercentage,
      tasks: project.tasks,
    };
  }
}
