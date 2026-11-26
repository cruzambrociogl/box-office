# Box office

Sell tickets to your events, and let people in at the door.

- **Organisers** create an event, add the kinds of ticket they sell (standing, seated, …) and put it
  on sale.
- **Buyers** pick tickets, pay on Stripe's checkout page, and get their ticket codes by email.
- **Door staff** type or scan each code; a ticket gets in once.

## How it works

Buying is the heart of it. When a buyer asks for seats, they are **held for 30 minutes** and the
buyer is sent to Stripe to pay. Stripe tells us when the payment went through (a webhook); only then
is the order paid. The tickets are issued and emailed **in the background**, so the buyer never waits
on email. Seats nobody paid for go back on sale after the hold expires.

Every morning at nine, everyone with tickets to something in the next day gets a reminder.

An organiser can give a webhook address of their own: the box office tells it each time tickets sell.

## What it is made of

| | |
|---|---|
| `web/` | The website, SvelteKit. Pages for buyers, organisers and the door |
| `api/` | The API and its background jobs, NestJS. The job queue lives in Postgres (pg-boss), so there is no other service to run |
| `api/migrations/` | The database schema, plain SQL |
| PostgreSQL | Everything the box office keeps |
| Stripe | Payments |
| An SMTP server | The emails |

## Running it

```sh
cp .env.example .env          # Stripe test keys, an SMTP server
docker compose up --build     # the website on :3001; it passes /api/… on to the API
docker compose exec api node dist/cli.js seed   # a sample organiser and an event on sale
stripe listen --forward-to localhost:3001/api/payments/webhook   # Stripe's webhooks, locally
```

## Tests

```sh
cd api && npm test
```

---

A small sample application, written to try [archdoc](https://github.com/cruzambrociogl/archdoc) on.
