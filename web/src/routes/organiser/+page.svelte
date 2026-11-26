<script lang="ts">
  import { untrack } from 'svelte';
  import { addTicketType, createEvent, publishEvent } from '$lib/api';
  let { data } = $props();

  let organiserId = $state(untrack(() => data.organisers[0]?.id ?? ''));
  let title = $state('');
  let venue = $state('');
  let startsAt = $state('');
  let draft = $state<{ id: string; title: string } | null>(null);
  let types = $state<{ name: string; priceCents: number; capacity: number }[]>([]);
  let typeName = $state('Standing');
  let typePrice = $state(15);
  let typeCapacity = $state(100);
  let published = $state(false);
  let error = $state('');

  async function startDraft(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    try {
      draft = await createEvent({ organiserId, title, venue, startsAt: new Date(startsAt).toISOString() });
    } catch (err) {
      error = (err as Error).message;
    }
  }

  async function addType(e: SubmitEvent) {
    e.preventDefault();
    if (!draft) return;
    error = '';
    const type = { name: typeName, priceCents: Math.round(typePrice * 100), capacity: typeCapacity };
    try {
      await addTicketType(draft.id, type);
      types = [...types, type];
    } catch (err) {
      error = (err as Error).message;
    }
  }

  async function publish() {
    if (!draft) return;
    error = '';
    try {
      await publishEvent(draft.id);
      published = true;
    } catch (err) {
      error = (err as Error).message;
    }
  }
</script>

<svelte:head><title>Sell tickets — Box office</title></svelte:head>

<h1>Sell tickets</h1>

{#if !draft}
  <form onsubmit={startDraft}>
    <h2>1. Create the event</h2>
    <label>
      Organiser
      <select bind:value={organiserId}>
        {#each data.organisers as organiser}<option value={organiser.id}>{organiser.name}</option>{/each}
      </select>
    </label>
    <label>Title <input required bind:value={title} /></label>
    <label>Venue <input required bind:value={venue} /></label>
    <label>Starts <input type="datetime-local" required bind:value={startsAt} /></label>
    <button>Create draft</button>
  </form>
{:else if !published}
  <form onsubmit={addType}>
    <h2>2. Add ticket types to “{draft.title}”</h2>
    <label>Name <input required bind:value={typeName} /></label>
    <label>Price ($) <input type="number" min="0" step="0.01" bind:value={typePrice} /></label>
    <label>Seats <input type="number" min="1" bind:value={typeCapacity} /></label>
    <button>Add ticket type</button>
  </form>
  <ul>
    {#each types as type}<li>{type.name}: {type.capacity} seats</li>{/each}
  </ul>
  <h2>3. Put it on sale</h2>
  <button onclick={publish}>Publish</button>
{:else}
  <p>“{draft.title}” is on sale. <a href={`/events/${draft.id}`}>See its page</a></p>
{/if}
{#if error}<p class="error">{error}</p>{/if}

<style>
  form { display: grid; gap: 0.75rem; max-width: 24rem; }
  label { display: grid; gap: 0.25rem; }
</style>
