import { ConflictException, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from '../tickets/tickets.repository';
import { CheckInsRepository } from './check-ins.repository';
import { CheckInsService } from './check-ins.service';

const valid = { id: 'k1', order_id: 'o1', event_id: 'e1', code: 'ABCD2345', status: 'valid' };

function setup(ticket: object | undefined) {
  const checkIns = { record: jest.fn().mockResolvedValue({ scanned_at: new Date() }) } as unknown as CheckInsRepository;
  const tickets = { findByCode: jest.fn().mockResolvedValue(ticket), markUsed: jest.fn() } as unknown as TicketsRepository;
  return { service: new CheckInsService(checkIns, tickets), checkIns, tickets };
}

describe('Checking in at the door', () => {
  it('lets a valid ticket in once', async () => {
    const { service, tickets } = setup(valid);
    await expect(service.scan({ eventId: 'e1', code: 'abcd2345' })).resolves.toMatchObject({ admitted: true });
    expect(tickets.markUsed).toHaveBeenCalledWith('k1');
  });

  it('refuses a ticket scanned twice', async () => {
    const { service, checkIns } = setup({ ...valid, status: 'used' });
    await expect(service.scan({ eventId: 'e1', code: 'ABCD2345' })).rejects.toThrow('This ticket was already scanned');
    expect(checkIns.record).not.toHaveBeenCalled();
  });

  it('refuses a ticket from a refunded order', async () => {
    const { service } = setup({ ...valid, status: 'void' });
    await expect(service.scan({ eventId: 'e1', code: 'ABCD2345' })).rejects.toThrow('This ticket was refunded');
  });

  it('refuses a ticket for another event', async () => {
    const { service } = setup(valid);
    await expect(service.scan({ eventId: 'e2', code: 'ABCD2345' })).rejects.toThrow(ConflictException);
  });

  it('refuses a code no ticket has', async () => {
    const { service } = setup(undefined);
    await expect(service.scan({ eventId: 'e1', code: 'NOPE' })).rejects.toThrow(NotFoundException);
  });
});
