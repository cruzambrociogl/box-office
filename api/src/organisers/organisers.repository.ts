import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class OrganisersRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  all() {
    return this.db.selectFrom('organisers').select(['id', 'name']).orderBy('name').execute();
  }

  create(organiser: { name: string; email: string; webhookUrl?: string }) {
    return this.db
      .insertInto('organisers')
      .values({ name: organiser.name, email: organiser.email, webhook_url: organiser.webhookUrl ?? null })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /** The organiser who runs an event. */
  forEvent(eventId: string) {
    return this.db
      .selectFrom('organisers')
      .innerJoin('events', 'events.organiser_id', 'organisers.id')
      .select(['organisers.id', 'organisers.name', 'organisers.webhook_url', 'events.title'])
      .where('events.id', '=', eventId)
      .executeTakeFirst();
  }
}
