import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class TicketsRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  issue(tickets: { orderId: string; eventId: string; code: string }[]) {
    return this.db
      .insertInto('tickets')
      .values(tickets.map((t) => ({ order_id: t.orderId, event_id: t.eventId, code: t.code, status: 'valid' as const })))
      .returningAll()
      .execute();
  }

  forOrder(orderId: string) {
    return this.db.selectFrom('tickets').select(['id', 'code', 'status']).where('order_id', '=', orderId).orderBy('created_at').execute();
  }

  findByCode(code: string) {
    return this.db.selectFrom('tickets').selectAll().where('code', '=', code).executeTakeFirst();
  }

  /** A refunded order's tickets no longer get in. */
  voidForOrder(orderId: string) {
    return this.db.updateTable('tickets').set({ status: 'void' }).where('order_id', '=', orderId).execute();
  }

  markUsed(id: string) {
    return this.db.updateTable('tickets').set({ status: 'used' }).where('id', '=', id).execute();
  }

  /** Who holds a ticket to an event starting in a window, one row per order. */
  holdersOfEventsBetween(from: Date, to: Date) {
    return this.db
      .selectFrom('tickets')
      .innerJoin('orders', 'orders.id', 'tickets.order_id')
      .innerJoin('events', 'events.id', 'tickets.event_id')
      .select(['orders.id as order_id', 'orders.buyer_name', 'orders.buyer_email', 'events.title', 'events.venue', 'events.starts_at'])
      .where('tickets.status', '=', 'valid')
      .where('events.starts_at', '>=', from)
      .where('events.starts_at', '<', to)
      .groupBy(['orders.id', 'events.id'])
      .execute();
  }
}
