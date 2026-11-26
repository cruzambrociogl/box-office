import { BadRequestException, ConflictException } from '@nestjs/common';
import { TicketTypesRepository } from '../events/ticket-types.repository';
import { JobsService } from '../jobs/jobs.service';
import { PaymentsService } from '../payments/payments.service';
import { TicketsRepository } from '../tickets/tickets.repository';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

const now = new Date('2026-06-01T12:00:00Z');
const standing = { id: 't1', event_id: 'e1', name: 'Standing', price_cents: 1500, capacity: 10, event_title: 'Jazz night', event_status: 'published', starts_at: new Date('2026-07-01T20:00:00Z') };
const held = { id: 'o1', event_id: 'e1', ticket_type_id: 't1', quantity: 2, buyer_name: 'Ana', buyer_email: 'ana@example.com', status: 'held' };
const buyer = { ticketTypeId: 't1', quantity: 2, buyerName: 'Ana', buyerEmail: 'ana@example.com' };

function setup({ type = standing as object | undefined, taken = 0, order = held as object | undefined } = {}) {
  const orders = {
    hold: jest.fn().mockResolvedValue(held),
    find: jest.fn().mockResolvedValue(order),
    seatsTaken: jest.fn().mockResolvedValue(taken),
    setCheckoutSession: jest.fn(),
    release: jest.fn(),
    markPaid: jest.fn(),
  } as unknown as OrdersRepository;
  const ticketTypes = { withEvent: jest.fn().mockResolvedValue(type) } as unknown as TicketTypesRepository;
  const tickets = { forOrder: jest.fn().mockResolvedValue([]) } as unknown as TicketsRepository;
  const payments = { startCheckout: jest.fn().mockResolvedValue({ sessionId: 'cs_1', url: 'https://checkout.stripe.com/c/cs_1' }) } as unknown as PaymentsService;
  const jobs = { queue: jest.fn() } as unknown as JobsService;
  return { service: new OrdersService(orders, ticketTypes, tickets, payments, jobs), orders, payments, jobs };
}

describe('Holding seats', () => {
  it('holds seats for thirty minutes and returns the Stripe checkout page', async () => {
    const { service, orders } = setup();
    const result = await service.hold(buyer, now);
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/c/cs_1');
    expect(result.expiresAt).toEqual(new Date('2026-06-01T12:30:00Z'));
    expect(orders.setCheckoutSession).toHaveBeenCalledWith('o1', 'cs_1');
  });

  it('lets the seats go when Stripe cannot open the checkout', async () => {
    const { service, orders, payments } = setup();
    (payments.startCheckout as jest.Mock).mockRejectedValue(new Error('Invalid API Key'));
    await expect(service.hold(buyer, now)).rejects.toThrow('Your seats were not kept');
    expect(orders.release).toHaveBeenCalledWith('o1');
    expect(orders.setCheckoutSession).not.toHaveBeenCalled();
  });

  it('refuses when the event is not on sale', async () => {
    const { service, payments } = setup({ type: { ...standing, event_status: 'draft' } });
    await expect(service.hold(buyer, now)).rejects.toThrow('Tickets for this event are not on sale');
    expect(payments.startCheckout).not.toHaveBeenCalled();
  });

  it('says sold out when every seat is held or paid', async () => {
    const { service } = setup({ taken: 10 });
    await expect(service.hold(buyer, now)).rejects.toThrow('Sold out');
  });

  it('refuses more tickets than are left', async () => {
    const { service } = setup({ taken: 9 });
    await expect(service.hold(buyer, now)).rejects.toThrow('Only 1 left');
  });

  it('refuses an order of more than ten tickets', async () => {
    const { service } = setup();
    await expect(service.hold({ ...buyer, quantity: 11 }, now)).rejects.toThrow(BadRequestException);
  });
});

describe('Confirming a payment', () => {
  it('marks the order paid and queues its tickets', async () => {
    const { service, orders, jobs } = setup();
    await service.confirmPayment('o1', now);
    expect(orders.markPaid).toHaveBeenCalledWith('o1', now);
    expect(jobs.queue).toHaveBeenCalledWith(expect.objectContaining({ name: 'issue-tickets' }));
  });

  it('ignores a payment it has already recorded', async () => {
    const { service, orders, jobs } = setup({ order: { ...held, status: 'paid' } });
    await service.confirmPayment('o1', now);
    expect(orders.markPaid).not.toHaveBeenCalled();
    expect(jobs.queue).not.toHaveBeenCalled();
  });

  it('refuses a payment that arrives after the hold expired', async () => {
    const { service } = setup({ order: { ...held, status: 'expired' } });
    await expect(service.confirmPayment('o1', now)).rejects.toThrow(ConflictException);
  });
});
