import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class OrdersRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  hold(order: { eventId: string; ticketTypeId: string; quantity: number; buyerName: string; buyerEmail: string; expiresAt: Date }) {
    return this.db
      .insertInto('orders')
      .values({
        event_id: order.eventId,
        ticket_type_id: order.ticketTypeId,
        quantity: order.quantity,
        buyer_name: order.buyerName,
        buyer_email: order.buyerEmail,
        status: 'held',
        expires_at: order.expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  find(id: string) {
    return this.db.selectFrom('orders').selectAll().where('id', '=', id).executeTakeFirst();
  }

  /** Seats of a ticket type that are held or paid for. */
  async seatsTaken(ticketTypeId: string) {
    const row = await this.db
      .selectFrom('orders')
      .select((eb) => eb.fn.coalesce(eb.fn.sum<number>('quantity'), eb.lit(0)).as('taken'))
      .where('ticket_type_id', '=', ticketTypeId)
      .where('status', 'in', ['held', 'paid'])
      .executeTakeFirstOrThrow();
    return Number(row.taken);
  }

  setCheckoutSession(id: string, sessionId: string) {
    return this.db.updateTable('orders').set({ stripe_session_id: sessionId }).where('id', '=', id).execute();
  }

  markPaid(id: string, paidAt: Date) {
    return this.db.updateTable('orders').set({ status: 'paid', paid_at: paidAt }).where('id', '=', id).execute();
  }

  /** Lets go of one hold at once: its checkout could not be opened. */
  release(id: string) {
    return this.db.updateTable('orders').set({ status: 'expired' }).where('id', '=', id).where('status', '=', 'held').execute();
  }

  /** Lets go of holds nobody paid for in time; their seats go back on sale. */
  async expireHolds(now: Date) {
    const rows = await this.db
      .updateTable('orders')
      .set({ status: 'expired' })
      .where('status', '=', 'held')
      .where('expires_at', '<', now)
      .returning('id')
      .execute();
    return rows.length;
  }
}
