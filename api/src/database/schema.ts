import { ColumnType, Generated } from 'kysely';

type CreatedAt = ColumnType<Date, Date | undefined, never>;

export interface OrganisersTable {
  id: Generated<string>;
  name: string;
  email: string;
  webhook_url: string | null;
  created_at: CreatedAt;
}

export interface EventsTable {
  id: Generated<string>;
  organiser_id: string;
  title: string;
  description: string;
  venue: string;
  starts_at: Date;
  status: 'draft' | 'published';
  created_at: CreatedAt;
}

export interface TicketTypesTable {
  id: Generated<string>;
  event_id: string;
  name: string;
  price_cents: number;
  capacity: number;
}

export interface OrdersTable {
  id: Generated<string>;
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  buyer_name: string;
  buyer_email: string;
  status: 'held' | 'paid' | 'expired' | 'refunded';
  stripe_session_id: string | null;
  payment_intent_id: Generated<string | null>;
  expires_at: Date;
  paid_at: Date | null;
  created_at: CreatedAt;
}

export interface TicketsTable {
  id: Generated<string>;
  order_id: string;
  event_id: string;
  code: string;
  status: 'valid' | 'used' | 'void';
  created_at: CreatedAt;
}

export interface CheckInsTable {
  id: Generated<string>;
  ticket_id: string;
  scanned_at: ColumnType<Date, Date | undefined, never>;
}

export interface RefundsTable {
  id: Generated<string>;
  order_id: string;
  amount_cents: number;
  stripe_refund_id: string;
  created_at: CreatedAt;
}

export interface Database {
  organisers: OrganisersTable;
  events: EventsTable;
  ticket_types: TicketTypesTable;
  orders: OrdersTable;
  tickets: TicketsTable;
  check_ins: CheckInsTable;
  refunds: RefundsTable;
}
