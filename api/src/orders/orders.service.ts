import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { TicketTypesRepository } from '../events/ticket-types.repository';
import { JobsService } from '../jobs/jobs.service';
import { PaymentsService } from '../payments/payments.service';
import { TicketsRepository } from '../tickets/tickets.repository';
import { OrdersRepository } from './orders.repository';

/** How long seats stay held while the buyer pays. Stripe's checkout lives as long. */
export const HOLD_MINUTES = 30;
export const MAX_TICKETS_PER_ORDER = 10;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly orders: OrdersRepository,
    private readonly ticketTypes: TicketTypesRepository,
    private readonly tickets: TicketsRepository,
    private readonly payments: PaymentsService,
    private readonly jobs: JobsService,
  ) {}

  /**
   * A buyer asks for seats. They are held for HOLD_MINUTES while the buyer pays on Stripe's checkout
   * page; the order is paid only when Stripe says so, through the webhook.
   */
  async hold(input: { ticketTypeId: string; quantity: number; buyerName: string; buyerEmail: string }, now = new Date()) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_TICKETS_PER_ORDER) {
      throw new BadRequestException(`An order is for 1 to ${MAX_TICKETS_PER_ORDER} tickets`);
    }
    const type = await this.ticketTypes.withEvent(input.ticketTypeId);
    if (!type) throw new NotFoundException('No ticket type has this id');
    if (type.event_status !== 'published' || type.starts_at <= now) throw new ConflictException('Tickets for this event are not on sale');
    const left = type.capacity - (await this.orders.seatsTaken(type.id));
    if (left <= 0) throw new ConflictException('Sold out');
    if (input.quantity > left) throw new ConflictException(`Only ${left} left`);

    const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000);
    const order = await this.orders.hold({ ...input, eventId: type.event_id, expiresAt });
    let checkout: { sessionId: string; url: string };
    try {
      checkout = await this.payments.startCheckout({
        orderId: order.id,
        description: `${type.event_title} — ${type.name}`,
        unitAmountCents: type.price_cents,
        quantity: order.quantity,
        buyerEmail: order.buyer_email,
        expiresAt,
      });
    } catch (err) {
      // Nobody can pay for these seats, so nobody keeps them.
      this.logger.error(`Stripe could not open a checkout for order ${order.id}: ${err}`);
      await this.orders.release(order.id);
      throw new ServiceUnavailableException('Payments are not working right now. Your seats were not kept; please try again soon.');
    }
    await this.orders.setCheckoutSession(order.id, checkout.sessionId);
    return { orderId: order.id, checkoutUrl: checkout.url, expiresAt };
  }

  /**
   * Stripe confirms the payment. The order becomes paid and its tickets are issued in the
   * background. Stripe may send the same event twice; the second time changes nothing.
   */
  async confirmPayment(orderId: string, paymentIntentId: string | null, now = new Date()) {
    const order = await this.orders.find(orderId);
    if (!order) throw new NotFoundException('No order has this id');
    if (order.status === 'paid' || order.status === 'refunded') return;
    if (order.status === 'expired') throw new ConflictException('The hold expired before the payment arrived');
    await this.orders.markPaid(order.id, now, paymentIntentId);
    await this.jobs.queue({
      name: 'issue-tickets',
      data: { orderId: order.id, eventId: order.event_id, quantity: order.quantity, buyerEmail: order.buyer_email, buyerName: order.buyer_name },
    });
  }

  /** An order with the tickets it holds, for the buyer's order page. */
  async show(orderId: string) {
    const order = await this.orders.find(orderId);
    if (!order) throw new NotFoundException('No order has this id');
    return { ...order, tickets: await this.tickets.forOrder(order.id) };
  }

  expireHolds(now = new Date()) {
    return this.orders.expireHolds(now);
  }
}
