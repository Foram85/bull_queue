import { IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EmployeeCSV {
  @ApiProperty({required: true})
  @IsNotEmpty()
  name: string;

  @ApiProperty({required: true})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({required: true})
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  age: number;

  @ApiProperty({required: true})
  @IsNotEmpty()
  position: string;
}
