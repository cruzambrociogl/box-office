-- Refunds: an order paid through Stripe can be given back before its event starts.

ALTER TABLE orders ADD COLUMN payment_intent_id text; -- Stripe's payment, kept so it can be refunded
-- orders.status gains 'refunded'; tickets.status gains 'void'.

CREATE TABLE refunds (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL UNIQUE REFERENCES orders (id),
  amount_cents     integer NOT NULL CHECK (amount_cents >= 0),
  stripe_refund_id text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
