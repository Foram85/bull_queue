import { Body, Controller, Get, Injectable, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ImportEmployeeDto } from './dto/import-employee.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@ApiTags('employees')
@Injectable()
@Controller('employees')
export class EmployeesController {
  constructor(
    @InjectQueue('import_employee') private importQueue: Queue,
    @InjectRepository(Employee)
    private employeeService: Repository<Employee>,
  ) {}

  @Post('import')
  @ApiBody({ type: ImportEmployeeDto })
  async importEmployees(@Body() dto: ImportEmployeeDto) {
    await this.importQueue.add('import', { fileUrl: dto.fileUrl });
    return { message: 'import job added to queue'}
  }

  @Get()
  async getEmployees(): Promise<Employee[]> {
    return await this.employeeService.find();
  }
}
