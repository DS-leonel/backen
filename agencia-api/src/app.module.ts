import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Department } from './departments/department.entity';
import { DepartmentsModule } from './departments/departments.module';
import { Employee } from './employees/employee.entity';
import { EmployeesModule } from './employees/employees.module';
import { Project } from './projects/project.entity';
import { ProjectsModule } from './projects/projects.module';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'agencia_db'),
        entities: [Department, Employee, Project, Task],
        synchronize: configService.get<string>('DB_SYNC', 'false') === 'true',
      }),
    }),
    DepartmentsModule,
    EmployeesModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
