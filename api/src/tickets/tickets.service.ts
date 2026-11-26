import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';
import { OrganisersService } from '../organisers/organisers.service';
import { TicketsRepository } from './tickets.repository';

/** A ticket's code: what the door scans. Eight characters, no 0/O or 1/I to misread. */
export function ticketCode(bytes = randomBytes(8)) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly organisers: OrganisersService,
    private readonly mail: MailService,
    private readonly jobs: JobsService,
  ) {}

  /** One ticket for each seat of a paid order, then the email that carries them. */
  async issueForOrder(order: { orderId: string; eventId: string; quantity: number; buyerEmail: string; buyerName: string }) {
    const issued = await this.tickets.issue(
      Array.from({ length: order.quantity }, () => ({ orderId: order.orderId, eventId: order.eventId, code: ticketCode() })),
    );
    await this.jobs.queue({ name: 'send-tickets', data: { orderId: order.orderId, buyerEmail: order.buyerEmail, buyerName: order.buyerName } });
    await this.organisers.notifySale({ eventId: order.eventId, orderId: order.orderId, quantity: issued.length });
    return issued;
  }

  /** Emails the buyer their ticket codes and the link to their order. */
  async emailTickets(order: { orderId: string; buyerEmail: string; buyerName: string }) {
    const tickets = await this.tickets.forOrder(order.orderId);
    const publicUrl = process.env.PUBLIC_URL ?? 'http://localhost:3001';
    const lines = tickets.map((t, i) => `Ticket ${i + 1}: ${t.code}`);
    await this.mail.send(
      order.buyerEmail,
      'Your tickets',
      [`Hi ${order.buyerName},`, '', 'Show these codes at the door:', ...lines, '', `Your order: ${publicUrl}/orders/${order.orderId}`].join('\n'),
    );
  }
}
