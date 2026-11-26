import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { TicketTypesRepository } from './ticket-types.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly events: EventsRepository,
    private readonly ticketTypes: TicketTypesRepository,
  ) {}

  /** An organiser starts an event as a draft; nobody can buy until it is published. */
  createDraft(input: { organiserId: string; title: string; description?: string; venue: string; startsAt: string }) {
    const startsAt = new Date(input.startsAt);
    if (Number.isNaN(startsAt.getTime())) throw new BadRequestException('The start time is not a date');
    return this.events.create({ ...input, startsAt });
  }

  async addTicketType(eventId: string, input: { name: string; priceCents: number; capacity: number }) {
    const event = await this.events.find(eventId);
    if (!event) throw new NotFoundException('No event has this id');
    if (event.status !== 'draft') throw new ConflictException('Ticket types can only be added before the event is published');
    if (input.capacity < 1) throw new BadRequestException('A ticket type needs at least one seat');
    return this.ticketTypes.create({ eventId, ...input });
  }

  /** Puts an event on sale. It needs a ticket type to sell and a start still ahead. */
  async publish(eventId: string, now = new Date()) {
    const event = await this.events.find(eventId);
    if (!event) throw new NotFoundException('No event has this id');
    if (event.status === 'published') throw new ConflictException('This event is already on sale');
    if (event.starts_at <= now) throw new BadRequestException('An event that has started cannot go on sale');
    const types = await this.ticketTypes.forEvent(eventId);
    if (types.length === 0) throw new BadRequestException('Add at least one ticket type before publishing');
    await this.events.publish(eventId);
    return { ...event, status: 'published' as const, ticketTypes: types };
  }

  upcoming(now = new Date()) {
    return this.events.upcoming(now);
  }

  async show(eventId: string) {
    const event = await this.events.find(eventId);
    if (!event) throw new NotFoundException('No event has this id');
    return { ...event, ticketTypes: await this.ticketTypes.forEvent(eventId) };
  }
}
