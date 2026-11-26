import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

/** Sends the emails buyers get: their tickets and reminders. */
@Injectable()
export class MailService {
  private readonly transport: Transporter = createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  async send(to: string, subject: string, text: string) {
    await this.transport.sendMail({ from: process.env.MAIL_FROM ?? 'Box office <tickets@example.com>', to, subject, text });
  }
}
