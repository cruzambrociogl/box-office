import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class CheckInsRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  record(ticketId: string) {
    return this.db.insertInto('check_ins').values({ ticket_id: ticketId }).returningAll().executeTakeFirstOrThrow();
  }
}
