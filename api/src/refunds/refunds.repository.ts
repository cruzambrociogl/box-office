import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/database.module';
import { Database } from '../database/schema';

@Injectable()
export class RefundsRepository {
  constructor(@Inject(DB) private readonly db: Kysely<Database>) {}

  record(refund: { orderId: string; amountCents: number; stripeRefundId: string }) {
    return this.db
      .insertInto('refunds')
      .values({ order_id: refund.orderId, amount_cents: refund.amountCents, stripe_refund_id: refund.stripeRefundId })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
