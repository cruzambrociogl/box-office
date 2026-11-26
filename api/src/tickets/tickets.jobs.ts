import { Injectable } from '@nestjs/common';
import { OnJob } from '../jobs/on-job.decorator';
import { TicketsService } from './tickets.service';

@Injectable()
export class TicketsJobs {
  constructor(private readonly ticketsService: TicketsService) {}

  /** Queued when Stripe confirms a payment. */
  @OnJob({ name: 'issue-tickets' })
  async issueTickets(data: { orderId: string; eventId: string; quantity: number; buyerEmail: string; buyerName: string }) {
    await this.ticketsService.issueForOrder(data);
  }

  /** Queued once an order's tickets exist. */
  @OnJob({ name: 'send-tickets' })
  async sendTickets(data: { orderId: string; buyerEmail: string; buyerName: string }) {
    await this.ticketsService.emailTickets(data);
  }
}
