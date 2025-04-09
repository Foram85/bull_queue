import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import * as csv from 'csv-parser';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeCSV } from './dto/employee-csv.dto';
import { EmailService } from './email.service';

@Processor('import_employee')
export class ImportProcessor {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private emailService: EmailService,
  ) {}

  @Process('import')
  async handleImport(job: Job<{ fileUrl: string }>) {
    const { fileUrl } = job.data;

    const response = await axios.get(fileUrl, { responseType: 'stream' });

    const rawRows: any[] = [];
    const validEmployees: Employee[] = [];
    const invalidRows: string[] = [];

    await new Promise<void>((resolve, reject) => {
      response.data
        .pipe(csv())
        .on('data', (row) => rawRows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of rawRows) {
      const employeeInstance = plainToInstance(EmployeeCSV, row);
      const errors = await validate(employeeInstance);

      if (errors.length === 0) {
        const emp = this.employeeRepo.create({
          ...employeeInstance,
          age: Number(employeeInstance.age),
        });
        validEmployees.push(emp);
      } else {
        const errorDetails = errors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');

        const rowSummary = `Row: ${JSON.stringify(row)} | Errors: ${errorDetails}`;
        invalidRows.push(rowSummary);
      }
    }

    if (validEmployees.length > 0) {
      await this.employeeRepo.save(validEmployees);
      console.log(`${validEmployees.length} employees saved.`);
    }

    if (invalidRows.length > 0) {
      const emailBody = [
        'The following rows failed validation:',
        '',
        ...invalidRows,
      ].join('\n');

      await this.emailService.sendEmail(
        'foram.s@solutelabs.com',
        'Invalid Employee Records - Import Failure',
        emailBody,
      );
    }
  }
}
