-- The box office's schema: who sells, what is on, what was bought, and who came in.

CREATE TABLE organisers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  webhook_url text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id uuid NOT NULL REFERENCES organisers (id),
  title        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  venue        text NOT NULL,
  starts_at    timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'draft', -- draft, published
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES events (id),
  name        text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  capacity    integer NOT NULL CHECK (capacity > 0)
);

CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          uuid NOT NULL REFERENCES events (id),
  ticket_type_id    uuid NOT NULL REFERENCES ticket_types (id),
  quantity          integer NOT NULL CHECK (quantity > 0),
  buyer_name        text NOT NULL,
  buyer_email       text NOT NULL,
  status            text NOT NULL DEFAULT 'held', -- held, paid, expired
  stripe_session_id text,
  expires_at        timestamptz NOT NULL,
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES orders (id),
  event_id   uuid NOT NULL REFERENCES events (id),
  code       text NOT NULL UNIQUE,
  status     text NOT NULL DEFAULT 'valid', -- valid, used
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE check_ins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  uuid NOT NULL REFERENCES tickets (id),
  scanned_at timestamptz NOT NULL DEFAULT now()
);
