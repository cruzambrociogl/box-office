import { Command, CommandRunner } from 'nest-commander';
import { EventsRepository } from '../events/events.repository';
import { TicketTypesRepository } from '../events/ticket-types.repository';
import { OrganisersRepository } from '../organisers/organisers.repository';

@Command({ name: 'seed', description: 'Fill an empty database with a sample organiser and an event on sale' })
export class SeedCommand extends CommandRunner {
  constructor(
    private readonly organisers: OrganisersRepository,
    private readonly events: EventsRepository,
    private readonly ticketTypes: TicketTypesRepository,
  ) {
    super();
  }

  async run() {
    const organiser = await this.organisers.create({ name: 'Riverside Hall', email: 'bookings@riverside.example' });
    const startsAt = new Date(Date.now() + 14 * 24 * 60 * 60_000);
    const event = await this.events.create({ organiserId: organiser.id, title: 'Jazz night', venue: 'Riverside Hall, main room', startsAt });
    await this.ticketTypes.create({ eventId: event.id, name: 'Standing', priceCents: 1500, capacity: 200 });
    await this.ticketTypes.create({ eventId: event.id, name: 'Seated', priceCents: 2500, capacity: 80 });
    await this.events.publish(event.id);
    console.log(`Seeded ${organiser.name} with "${event.title}" on sale`);
  }
}
