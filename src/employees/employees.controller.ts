import { Body, Controller, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ImportEmployeeDto } from './dto/import-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(@InjectQueue('import_employee') private importQueue: Queue) {}

  @Post('import')
  async importEmployees(@Body() dto: ImportEmployeeDto) {
    await this.importQueue.add('import', { fileUrl: dto.fileUrl });
    return { message: 'Import job added to queue' };
  }
}
