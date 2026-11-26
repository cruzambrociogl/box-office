<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { refundOrder } from '$lib/api';
  let { data } = $props();

  let error = $state('');
  let asking = $state(false);
  const anyUsed = $derived(data.order.tickets.some((t) => t.status === 'used'));

  async function refund() {
    if (!confirm('Give these tickets back? The money returns to your card and the codes stop working.')) return;
    error = '';
    asking = true;
    try {
      await refundOrder(data.order.id);
      await invalidateAll();
    } catch (err) {
      error = (err as Error).message;
    }
    asking = false;
  }

  // Tickets are issued in the background after Stripe confirms the payment: look again until they are here.
  onMount(() => {
    const timer = setInterval(() => {
      if (data.order.status === 'held' || (data.order.status === 'paid' && data.order.tickets.length === 0)) invalidateAll();
    }, 3000);
    return () => clearInterval(timer);
  });
</script>

<svelte:head><title>Your order — Box office</title></svelte:head>

<h1>Your order</h1>
{#if data.order.status === 'held'}
  <p>Waiting for your payment to be confirmed…</p>
{:else if data.order.status === 'refunded'}
  <p>Refunded. The money is on its way back to your card, and these tickets no longer get in.</p>
{:else if data.order.status === 'expired'}
  <p class="error">Your hold expired before the payment arrived. The seats went back on sale.</p>
{:else if data.order.tickets.length === 0}
  <p>Paid. Your tickets are on their way.</p>
{:else}
  <p>Paid. Show these codes at the door — we also emailed them to you.</p>
  <ul class="tickets">
    {#each data.order.tickets as ticket}
      <li><code>{ticket.code}</code> {ticket.status === 'used' ? '· used' : ''}</li>
    {/each}
  </ul>
  {#if !anyUsed}
    <button onclick={refund} disabled={asking}>Ask for a refund</button>
  {/if}
{/if}
{#if error}<p class="error">{error}</p>{/if}

<style>
  .tickets code { font-size: 1.4rem; letter-spacing: 0.15em; }
</style>
