<script lang="ts">
  import { untrack } from 'svelte';
  import { holdSeats } from '$lib/api';
  import { price, when } from '$lib/money';
  let { data } = $props();

  let ticketTypeId = $state(untrack(() => data.event.ticketTypes[0]?.id ?? ''));
  let quantity = $state(1);
  let buyerName = $state('');
  let buyerEmail = $state('');
  let error = $state('');
  let busy = $state(false);

  async function buy(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    busy = true;
    try {
      const hold = await holdSeats({ ticketTypeId, quantity, buyerName, buyerEmail });
      // Stripe's checkout page; it sends the buyer back to their order.
      window.location.href = hold.checkoutUrl;
    } catch (err) {
      error = (err as Error).message;
      busy = false;
    }
  }
</script>

<svelte:head><title>{data.event.title} — Box office</title></svelte:head>

<h1>{data.event.title}</h1>
<p>{when(data.event.starts_at)} · {data.event.venue}</p>
{#if data.event.description}<p>{data.event.description}</p>{/if}

<form onsubmit={buy}>
  <h2>Buy tickets</h2>
  <label>
    Ticket
    <select bind:value={ticketTypeId}>
      {#each data.event.ticketTypes as type}
        <option value={type.id}>{type.name} — {price(type.price_cents)}</option>
      {/each}
    </select>
  </label>
  <label>How many <input type="number" min="1" max="10" bind:value={quantity} /></label>
  <label>Your name <input required bind:value={buyerName} /></label>
  <label>Your email <input type="email" required bind:value={buyerEmail} /></label>
  <p>Your seats are held for 30 minutes while you pay.</p>
  <button disabled={busy}>Continue to payment</button>
  {#if error}<p class="error">{error}</p>{/if}
</form>

<style>
  form { display: grid; gap: 0.75rem; max-width: 24rem; }
  label { display: grid; gap: 0.25rem; }
</style>
