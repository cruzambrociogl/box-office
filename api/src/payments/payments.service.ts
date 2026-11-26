import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

export type PaymentEvent =
  | { type: 'paid'; orderId: string }
  | { type: 'ignored' };

/** Everything that talks to Stripe: the checkout page a buyer pays on, and what Stripe tells us back. */
@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_unset');

  async startCheckout(input: { orderId: string; description: string; unitAmountCents: number; quantity: number; buyerEmail: string; expiresAt: Date }) {
    const publicUrl = process.env.PUBLIC_URL ?? 'http://localhost:3001';
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: input.buyerEmail,
      line_items: [
        {
          quantity: input.quantity,
          price_data: { currency: 'usd', unit_amount: input.unitAmountCents, product_data: { name: input.description } },
        },
      ],
      metadata: { orderId: input.orderId },
      expires_at: Math.floor(input.expiresAt.getTime() / 1000),
      success_url: `${publicUrl}/orders/${input.orderId}`,
      cancel_url: `${publicUrl}/orders/${input.orderId}`,
    });
    return { sessionId: session.id, url: session.url ?? '' };
  }

  /** Reads a webhook Stripe sent, refusing one that Stripe did not sign. */
  readWebhook(rawBody: Buffer | undefined, signature: string | undefined): PaymentEvent {
    if (!rawBody || !signature) throw new BadRequestException('Not a signed Stripe webhook');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '');
    } catch {
      throw new BadRequestException('The Stripe signature does not match');
    }
    if (event.type !== 'checkout.session.completed') return { type: 'ignored' };
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId || session.payment_status !== 'paid') return { type: 'ignored' };
    return { type: 'paid', orderId };
  }
}
