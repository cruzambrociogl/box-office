import { BadRequestException, ConflictException } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { TicketTypesRepository } from './ticket-types.repository';

const now = new Date('2026-06-01T12:00:00Z');
const draft = { id: 'e1', organiser_id: 'o1', title: 'Jazz night', description: '', venue: 'Hall', starts_at: new Date('2026-07-01T20:00:00Z'), status: 'draft' as const, created_at: now };

function setup(event: object | undefined, types: object[] = []) {
  const events = { find: jest.fn().mockResolvedValue(event), publish: jest.fn() } as unknown as EventsRepository;
  const ticketTypes = { forEvent: jest.fn().mockResolvedValue(types), create: jest.fn((t) => t) } as unknown as TicketTypesRepository;
  return { service: new EventsService(events, ticketTypes), events, ticketTypes };
}

describe('Publishing an event', () => {
  it('puts a draft with ticket types on sale', async () => {
    const { service, events } = setup(draft, [{ id: 't1' }]);
    const published = await service.publish('e1', now);
    expect(published.status).toBe('published');
    expect(events.publish).toHaveBeenCalledWith('e1');
  });

  it('refuses to publish an event with no ticket types', async () => {
    const { service, events } = setup(draft, []);
    await expect(service.publish('e1', now)).rejects.toThrow(BadRequestException);
    expect(events.publish).not.toHaveBeenCalled();
  });

  it('refuses to publish an event that is already on sale', async () => {
    const { service } = setup({ ...draft, status: 'published' }, [{ id: 't1' }]);
    await expect(service.publish('e1', now)).rejects.toThrow(ConflictException);
  });

  it('refuses to put an event on sale once it has started', async () => {
    const { service } = setup({ ...draft, starts_at: new Date('2026-05-01T20:00:00Z') }, [{ id: 't1' }]);
    await expect(service.publish('e1', now)).rejects.toThrow('An event that has started cannot go on sale');
  });
});

describe('Adding ticket types', () => {
  it('adds a ticket type to a draft', async () => {
    const { service, ticketTypes } = setup(draft);
    await service.addTicketType('e1', { name: 'Standing', priceCents: 1500, capacity: 200 });
    expect(ticketTypes.create).toHaveBeenCalledWith({ eventId: 'e1', name: 'Standing', priceCents: 1500, capacity: 200 });
  });

  it('refuses new ticket types once the event is on sale', async () => {
    const { service } = setup({ ...draft, status: 'published' });
    await expect(service.addTicketType('e1', { name: 'VIP', priceCents: 5000, capacity: 10 })).rejects.toThrow(ConflictException);
  });
});
