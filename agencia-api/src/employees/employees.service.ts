import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../departments/department.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const department = await this.departmentsRepository.findOne({
      where: { id: createEmployeeDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Departamento con id ${createEmployeeDto.departmentId} no encontrado`,
      );
    }

    const employee = this.employeesRepository.create({
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      email: createEmployeeDto.email,
      department,
    });

    return this.employeesRepository.save(employee);
  }

  findAll() {
    return this.employeesRepository.find({
      relations: { department: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: { department: true },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con id ${id} no encontrado`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentsRepository.findOne({
        where: { id: updateEmployeeDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Departamento con id ${updateEmployeeDto.departmentId} no encontrado`,
        );
      }
      employee.department = department;
    }

    if (updateEmployeeDto.firstName !== undefined) {
      employee.firstName = updateEmployeeDto.firstName;
    }
    if (updateEmployeeDto.lastName !== undefined) {
      employee.lastName = updateEmployeeDto.lastName;
    }
    if (updateEmployeeDto.email !== undefined) {
      employee.email = updateEmployeeDto.email;
    }

    return this.employeesRepository.save(employee);
  }
}
