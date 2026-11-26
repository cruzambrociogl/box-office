import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class TicketTypesRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  create(type: { eventId: string; name: string; priceCents: number; capacity: number }) {
    return this.db
      .insertInto('ticket_types')
      .values({ event_id: type.eventId, name: type.name, price_cents: type.priceCents, capacity: type.capacity })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  forEvent(eventId: string) {
    return this.db.selectFrom('ticket_types').selectAll().where('event_id', '=', eventId).orderBy('price_cents').execute();
  }

  /** A ticket type with what a buyer needs to know about its event. */
  withEvent(id: string) {
    return this.db
      .selectFrom('ticket_types')
      .innerJoin('events', 'events.id', 'ticket_types.event_id')
      .select([
        'ticket_types.id',
        'ticket_types.event_id',
        'ticket_types.name',
        'ticket_types.price_cents',
        'ticket_types.capacity',
        'events.title as event_title',
        'events.status as event_status',
        'events.starts_at',
      ])
      .where('ticket_types.id', '=', id)
      .executeTakeFirst();
  }
}
