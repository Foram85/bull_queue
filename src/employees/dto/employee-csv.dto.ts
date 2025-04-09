import { IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeCSV {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  age: number;

  @IsNotEmpty()
  position: string;
}
