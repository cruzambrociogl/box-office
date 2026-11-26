import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { TicketsModule } from '../tickets/tickets.module';
import { RemindersJobs } from './reminders.jobs';
import { RemindersSchedule } from './reminders.schedule';
import { RemindersService } from './reminders.service';

@Module({
  imports: [MailModule, TicketsModule],
  providers: [RemindersService, RemindersSchedule, RemindersJobs],
})
export class RemindersModule {}
