// The box office API, as api/openapi.json describes it: one function per operation, named after its
// operationId. Pages pass their own fetch, so SvelteKit can run them on the server too.

type Fetch = typeof fetch;

export type EventSummary = { id: string; title: string; venue: string; starts_at: string };
export type TicketType = { id: string; name: string; price_cents: number; capacity: number };
export type EventDetail = EventSummary & { description: string; status: string; ticketTypes: TicketType[] };
export type Order = {
  id: string;
  status: 'held' | 'paid' | 'expired' | 'refunded';
  quantity: number;
  buyer_name: string;
  expires_at: string;
  tickets: { id: string; code: string; status: string }[];
};

/** A refusal from the API, with the sentence it gave. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function answer<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body.message ?? 'Something went wrong');
  return body as T;
}

const json = (body: unknown) => ({ headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export const listOrganisers = (fetch: Fetch = globalThis.fetch) => fetch('/api/organisers').then(answer<{ id: string; name: string }[]>);

export const listUpcomingEvents = (fetch: Fetch = globalThis.fetch) => fetch('/api/events').then(answer<EventSummary[]>);

export const getEvent = (id: string, fetch: Fetch = globalThis.fetch) => fetch(`/api/events/${id}`).then(answer<EventDetail>);

export const createEvent = (event: { organiserId: string; title: string; venue: string; startsAt: string }, fetch: Fetch = globalThis.fetch) =>
  fetch('/api/events', { method: 'POST', ...json(event) }).then(answer<{ id: string; title: string }>);

export const addTicketType = (eventId: string, type: { name: string; priceCents: number; capacity: number }, fetch: Fetch = globalThis.fetch) =>
  fetch(`/api/events/${eventId}/ticket-types`, { method: 'POST', ...json(type) }).then(answer<TicketType>);

export const publishEvent = (eventId: string, fetch: Fetch = globalThis.fetch) =>
  fetch(`/api/events/${eventId}/publish`, { method: 'POST' }).then(answer<EventDetail>);

export const holdSeats = (order: { ticketTypeId: string; quantity: number; buyerName: string; buyerEmail: string }, fetch: Fetch = globalThis.fetch) =>
  fetch('/api/orders', { method: 'POST', ...json(order) }).then(answer<{ orderId: string; checkoutUrl: string; expiresAt: string }>);

export const getOrder = (id: string, fetch: Fetch = globalThis.fetch) => fetch(`/api/orders/${id}`).then(answer<Order>);

export const refundOrder = (id: string, fetch: Fetch = globalThis.fetch) =>
  fetch(`/api/orders/${id}/refund`, { method: 'POST' }).then(answer<{ refunded: boolean; amountCents: number }>);

export const scanTicket = (scan: { eventId: string; code: string }, fetch: Fetch = globalThis.fetch) =>
  fetch('/api/check-ins', { method: 'POST', ...json(scan) }).then(answer<{ admitted: boolean }>);
