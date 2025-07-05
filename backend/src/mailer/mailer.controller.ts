import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('welcome')
  async sendWelcome(@Body() body: { email: string; name: string }) {
    return this.mailerService.sendWelcomeEmail(body.email, body.name);
  }

  @Post('reset-password')
  async sendResetPassword(@Body() body: { email: string; code: string; name: string }) {
    return this.mailerService.sendVerificationCodeEmail(body.email, body.code, body.name);
  }

  @Post('certificate')
  async sendCertificate(@Body() body: { email: string; name: string; courseTitle: string }) {
    return this.mailerService.sendCertificateIssuedEmail(body.email, body.name, body.courseTitle);
  }

  @Post('test')
  async testConnection() {
    const result = await this.mailerService.testEmailConnection();
    return { status: result ? 'OK' : 'FAIL' };
  }
}
