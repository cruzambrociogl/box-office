import { ConflictException, NotFoundException } from '@nestjs/common';
import { TicketTypesRepository } from '../events/ticket-types.repository';
import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';
import { OrdersRepository } from '../orders/orders.repository';
import { PaymentsService } from '../payments/payments.service';
import { TicketsRepository } from '../tickets/tickets.repository';
import { RefundsRepository } from './refunds.repository';
import { RefundsService } from './refunds.service';

const now = new Date('2026-06-01T12:00:00Z');
const paid = { id: 'o1', ticket_type_id: 't1', status: 'paid', payment_intent_id: 'pi_1', buyer_email: 'ana@example.com', buyer_name: 'Ana' };
const standing = { id: 't1', event_title: 'Jazz night', starts_at: new Date('2026-07-01T20:00:00Z') };

function setup({ order = paid as object | null, type = standing as object, tickets = [{ status: 'valid' }] } = {}) {
  const refunds = { record: jest.fn() } as unknown as RefundsRepository;
  const orders = { find: jest.fn().mockResolvedValue(order ?? undefined), markRefunded: jest.fn() } as unknown as OrdersRepository;
  const ticketTypes = { withEvent: jest.fn().mockResolvedValue(type) } as unknown as TicketTypesRepository;
  const ticketsRepo = { forOrder: jest.fn().mockResolvedValue(tickets), voidForOrder: jest.fn() } as unknown as TicketsRepository;
  const payments = { refund: jest.fn().mockResolvedValue({ refundId: 're_1', amountCents: 3000 }) } as unknown as PaymentsService;
  const mail = { send: jest.fn() } as unknown as MailService;
  const jobs = { queue: jest.fn() } as unknown as JobsService;
  const service = new RefundsService(refunds, orders, ticketTypes, ticketsRepo, payments, mail, jobs);
  return { service, refunds, orders, ticketsRepo, payments, mail, jobs };
}

describe('Refunding an order', () => {
  it('gives the money back, voids the tickets and queues the confirmation', async () => {
    const { service, refunds, orders, ticketsRepo, jobs } = setup();
    await expect(service.refund('o1', now)).resolves.toEqual({ refunded: true, amountCents: 3000 });
    expect(refunds.record).toHaveBeenCalledWith({ orderId: 'o1', amountCents: 3000, stripeRefundId: 're_1' });
    expect(orders.markRefunded).toHaveBeenCalledWith('o1');
    expect(ticketsRepo.voidForOrder).toHaveBeenCalledWith('o1');
    expect(jobs.queue).toHaveBeenCalledWith(expect.objectContaining({ name: 'send-refund-confirmation' }));
  });

  it('refuses an order that was never paid', async () => {
    const { service, payments } = setup({ order: { ...paid, status: 'held' } });
    await expect(service.refund('o1', now)).rejects.toThrow('Only a paid order can be refunded');
    expect(payments.refund).not.toHaveBeenCalled();
  });

  it('refuses once the event has started', async () => {
    const { service } = setup({ type: { ...standing, starts_at: new Date('2026-05-31T20:00:00Z') } });
    await expect(service.refund('o1', now)).rejects.toThrow('The event has already started');
  });

  it('refuses when someone from the order is already inside', async () => {
    const { service, payments } = setup({ tickets: [{ status: 'valid' }, { status: 'used' }] });
    await expect(service.refund('o1', now)).rejects.toThrow(ConflictException);
    expect(payments.refund).not.toHaveBeenCalled();
  });

  it('refuses an order it does not know', async () => {
    const { service } = setup({ order: null });
    await expect(service.refund('o1', now)).rejects.toThrow(NotFoundException);
  });

  it('tells the buyer how much came back', async () => {
    const { service, mail } = setup();
    await service.confirm({ email: 'ana@example.com', name: 'Ana', title: 'Jazz night', amountCents: 3000 });
    expect(mail.send).toHaveBeenCalledWith('ana@example.com', 'Refunded: Jazz night', expect.stringContaining('$30.00'));
  });
});
