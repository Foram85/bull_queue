import { IsNotEmpty, IsUrl } from 'class-validator';

export class ImportEmployeeDto {
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;
}