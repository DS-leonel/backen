import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsDateString()
  startDate: string;

  @IsInt()
  @Min(1)
  departmentId: number;
}
