import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(' Email Sent ');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:\n', body);
  }
}
