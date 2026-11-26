import { Injectable } from '@nestjs/common';
import { OnJob } from '../jobs/on-job.decorator';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersJobs {
  constructor(private readonly remindersService: RemindersService) {}

  /** Queued each morning, once for each order going to tomorrow's events. */
  @OnJob({ name: 'send-reminder' })
  async sendReminder(data: { email: string; name: string; title: string; venue: string; startsAt: string }) {
    await this.remindersService.send(data);
  }
}
