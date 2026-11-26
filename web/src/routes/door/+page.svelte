<script lang="ts">
  import { untrack } from 'svelte';
  import { scanTicket } from '$lib/api';
  let { data } = $props();

  let eventId = $state(untrack(() => data.events[0]?.id ?? ''));
  let code = $state('');
  let result = $state<{ ok: boolean; text: string } | null>(null);

  async function scan(e: SubmitEvent) {
    e.preventDefault();
    try {
      await scanTicket({ eventId, code });
      result = { ok: true, text: 'Welcome in' };
    } catch (err) {
      result = { ok: false, text: (err as Error).message };
    }
    code = '';
  }
</script>

<svelte:head><title>At the door — Box office</title></svelte:head>

<h1>At the door</h1>
<form onsubmit={scan}>
  <label>
    Event
    <select bind:value={eventId}>
      {#each data.events as event}<option value={event.id}>{event.title}</option>{/each}
    </select>
  </label>
  <label>Ticket code <input required autocomplete="off" bind:value={code} /></label>
  <button>Check in</button>
</form>
{#if result}
  <p class={result.ok ? 'admitted' : 'error'}>{result.text}</p>
{/if}

<style>
  form { display: grid; gap: 0.75rem; max-width: 24rem; }
  label { display: grid; gap: 0.25rem; }
  .admitted { color: #1d6b35; font-size: 1.5rem; }
  .error { font-size: 1.5rem; }
</style>
