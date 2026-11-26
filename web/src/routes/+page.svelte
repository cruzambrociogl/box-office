<script lang="ts">
  import { when } from '$lib/money';
  let { data } = $props();
</script>

<svelte:head><title>What's on — Box office</title></svelte:head>

<h1>What's on</h1>
{#if data.events.length === 0}
  <p>Nothing on sale right now. Check back soon.</p>
{:else}
  <ul>
    {#each data.events as event}
      <li>
        <a href={`/events/${event.id}`}>{event.title}</a>
        <span>{when(event.starts_at)} · {event.venue}</span>
      </li>
    {/each}
  </ul>
{/if}
