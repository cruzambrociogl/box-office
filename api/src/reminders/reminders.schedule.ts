import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersSchedule {
  private readonly logger = new Logger(RemindersSchedule.name);

  constructor(private readonly remindersService: RemindersService) {}

  /** Every morning at nine, everyone going to something in the next day is reminded. */
  @Cron('0 9 * * *')
  async remind() {
    const queued = await this.remindersService.queueForTomorrow();
    this.logger.log(`${queued} reminders queued`);
  }
}
