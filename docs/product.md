# Product notes

## Who uses it

- **Buyers**, on their phone, a few minutes before they lose interest. Buying has to be quick and
  must never sell a seat twice.
- **Organisers**, a small venue or a club, setting up an event once and watching it sell.
- **Door staff**, at the entrance with a queue in front of them. A scan answers yes or no, in words
  they can say out loud.

## The rules

- **A hold lasts 30 minutes.** Seats are taken from sale while the buyer pays; if Stripe has not
  confirmed by then, they go back.
- **An order is 1 to 10 tickets**, all of one ticket type.
- **An event is a draft until it is published.** Ticket types are added to the draft; an event needs
  at least one before it goes on sale, and its start must still be ahead.
- **A ticket gets in once**, and only to its own event.
- **Payment is what Stripe says.** The order is paid when Stripe's webhook says so, never when the
  buyer comes back from the checkout page. Stripe may say it twice; the second time changes nothing.
- **A refund is in full, before the event starts**, and only if no ticket of the order has been
  used. The tickets are void from then on; a refunded ticket at the door is refused in those words.
- **Emails never hold anyone up.** Tickets and reminders are sent in the background.
