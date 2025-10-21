<template>
  <section class="wrap">
    <h1>404</h1>
    <p>The page you’re looking for doesn’t exist.</p>
    <RouterLink to="/" class="home">Go back home</RouterLink>
  </section>
</template>

<script setup>
// Simple not-found view
</script>

<style scoped>
.wrap { padding: 2rem 1rem; }
h1 { font-size: 2rem; margin: 0 0 0.5rem; }
.home { color: var(--c-link); }
</style>

