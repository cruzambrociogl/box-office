import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';
import { TicketsRepository } from '../tickets/tickets.repository';

const DAY = 24 * 60 * 60_000;

@Injectable()
export class RemindersService {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly mail: MailService,
    private readonly jobs: JobsService,
  ) {}

  /** Queues one reminder for each order with tickets to an event in the next day. */
  async queueForTomorrow(now = new Date()) {
    const holders = await this.tickets.holdersOfEventsBetween(now, new Date(now.getTime() + DAY));
    for (const h of holders) {
      await this.jobs.queue({
        name: 'send-reminder',
        data: { email: h.buyer_email, name: h.buyer_name, title: h.title, venue: h.venue, startsAt: h.starts_at },
      });
    }
    return holders.length;
  }

  async send(reminder: { email: string; name: string; title: string; venue: string; startsAt: string | Date }) {
    const when = new Date(reminder.startsAt).toUTCString();
    await this.mail.send(reminder.email, `Tomorrow: ${reminder.title}`, `Hi ${reminder.name},\n\n${reminder.title} starts ${when} at ${reminder.venue}. Bring your ticket codes.`);
  }
}
