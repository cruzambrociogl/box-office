import { Injectable, Logger } from '@nestjs/common';
import { OrganisersRepository } from './organisers.repository';

@Injectable()
export class OrganisersService {
  private readonly logger = new Logger(OrganisersService.name);

  constructor(private readonly organisers: OrganisersRepository) {}

  list() {
    return this.organisers.all();
  }

  /**
   * Tells an organiser's own system that tickets sold, when they have given a webhook address. The
   * address is theirs: the box office does not know what is behind it, and a failure there never
   * stops the sale.
   */
  async notifySale(sale: { eventId: string; orderId: string; quantity: number }) {
    const organiser = await this.organisers.forEvent(sale.eventId);
    if (!organiser?.webhook_url) return;
    try {
      await fetch(organiser.webhook_url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'tickets.sold', event: organiser.title, ...sale }),
      });
    } catch (err) {
      this.logger.warn(`The webhook of ${organiser.name} did not answer: ${err}`);
    }
  }
}
