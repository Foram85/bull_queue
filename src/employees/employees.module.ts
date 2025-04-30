import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EmployeesController } from './employees.controller';
import { ImportProcessor } from './import.processor';
import { Employee } from './entities/employee.entity';
import { EmailService } from './email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    BullModule.registerQueue({
      name: 'import_employee',
    }),
  ],
  controllers: [EmployeesController],
  providers: [ImportProcessor, EmailService],
})
export class EmployeesModule {}