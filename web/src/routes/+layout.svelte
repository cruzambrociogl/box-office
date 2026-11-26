<script lang="ts">
  let { children } = $props();
</script>

<header>
  <a class="brand" href="/">Box office</a>
  <nav>
    <a href="/">Events</a>
    <a href="/organiser">For organisers</a>
    <a href="/door">At the door</a>
  </nav>
</header>

<main>
  {@render children()}
</main>

<style>
  :global(body) { font-family: system-ui, sans-serif; margin: 0; background: #faf9f7; color: #1d1b18; }
  :global(button) { font: inherit; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #1d1b18; background: #1d1b18; color: white; cursor: pointer; }
  :global(input, select) { font: inherit; padding: 0.45rem; border-radius: 6px; border: 1px solid #c9c4bb; }
  :global(.error) { color: #a4271b; }
  header { display: flex; gap: 2rem; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e4e0d8; }
  .brand { font-weight: 700; text-decoration: none; color: inherit; }
  nav { display: flex; gap: 1rem; }
  nav a { color: #5b564d; }
  main { max-width: 46rem; margin: 0 auto; padding: 1.5rem; }
</style>
