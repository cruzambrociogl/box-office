import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketTypesRepository } from '../events/ticket-types.repository';
import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';
import { OrdersRepository } from '../orders/orders.repository';
import { PaymentsService } from '../payments/payments.service';
import { TicketsRepository } from '../tickets/tickets.repository';
import { RefundsRepository } from './refunds.repository';

@Injectable()
export class RefundsService {
  constructor(
    private readonly refunds: RefundsRepository,
    private readonly orders: OrdersRepository,
    private readonly ticketTypes: TicketTypesRepository,
    private readonly tickets: TicketsRepository,
    private readonly payments: PaymentsService,
    private readonly mail: MailService,
    private readonly jobs: JobsService,
  ) {}

  /**
   * A buyer gives their tickets back. Stripe returns the money in full; the tickets stop getting in
   * and the seats go back on sale. Only before the event starts, and only if nobody from the order
   * has been in yet.
   */
  async refund(orderId: string, now = new Date()) {
    const order = await this.orders.find(orderId);
    if (!order) throw new NotFoundException('No order has this id');
    if (order.status !== 'paid') throw new ConflictException('Only a paid order can be refunded');
    if (!order.payment_intent_id) throw new ConflictException('Stripe has no payment to give back for this order');
    const type = await this.ticketTypes.withEvent(order.ticket_type_id);
    if (!type || type.starts_at <= now) throw new ConflictException('The event has already started');
    const tickets = await this.tickets.forOrder(order.id);
    if (tickets.some((t) => t.status === 'used')) throw new ConflictException('A ticket from this order was already used at the door');

    const given = await this.payments.refund(order.payment_intent_id);
    await this.refunds.record({ orderId: order.id, amountCents: given.amountCents, stripeRefundId: given.refundId });
    await this.orders.markRefunded(order.id);
    await this.tickets.voidForOrder(order.id);
    await this.jobs.queue({
      name: 'send-refund-confirmation',
      data: { email: order.buyer_email, name: order.buyer_name, title: type.event_title, amountCents: given.amountCents },
    });
    return { refunded: true, amountCents: given.amountCents };
  }

  async confirm(refund: { email: string; name: string; title: string; amountCents: number }) {
    const amount = `$${(refund.amountCents / 100).toFixed(2)}`;
    await this.mail.send(
      refund.email,
      `Refunded: ${refund.title}`,
      `Hi ${refund.name},\n\nWe gave back ${amount} for your tickets to ${refund.title}. Those tickets no longer get in.`,
    );
  }
}
