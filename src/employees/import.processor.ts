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
import { generateInvalidCSV } from './utils/csv.utils';

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
    const invalidRows: any[] = [];

    await new Promise<void>((resolve, reject) => {
      response.data
        .pipe(csv())
        .on('data', (row: any[]) => rawRows.push(row))
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

          invalidRows.push({
          ...row,
          errors: errorDetails,
        });
      }
    }

    if (validEmployees.length > 0) {
      await this.employeeRepo.save(validEmployees);
      console.log(`${validEmployees.length} employees saved.`);
    }

    if (invalidRows.length > 0) {
      const fileUrl = await generateInvalidCSV(invalidRows);
  
      const emailBody =
      ` 
        The following employee rows failed validation during import.
  
        You can download the CSV from: ${fileUrl}
      `
      ;
  
      await this.emailService.sendEmail(
        'foram.s@solutelabs.com',
        'Invalid Employee Records - Import Failure',
        emailBody,
      );
    }
  }    
}