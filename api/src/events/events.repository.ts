import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  create(event: { organiserId: string; title: string; description?: string; venue: string; startsAt: Date }) {
    return this.db
      .insertInto('events')
      .values({
        organiser_id: event.organiserId,
        title: event.title,
        description: event.description ?? '',
        venue: event.venue,
        starts_at: event.startsAt,
        status: 'draft',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  find(id: string) {
    return this.db.selectFrom('events').selectAll().where('id', '=', id).executeTakeFirst();
  }

  /** What is on sale and still to come, soonest first. */
  upcoming(now: Date) {
    return this.db
      .selectFrom('events')
      .selectAll()
      .where('status', '=', 'published')
      .where('starts_at', '>', now)
      .orderBy('starts_at')
      .execute();
  }

  publish(id: string) {
    return this.db.updateTable('events').set({ status: 'published' }).where('id', '=', id).executeTakeFirst();
  }
}
