<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  let { data } = $props();

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
{/if}

<style>
  .tickets code { font-size: 1.4rem; letter-spacing: 0.15em; }
</style>
