import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class ImportEmployeeDto {
  @ApiProperty({required: true})
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;
}