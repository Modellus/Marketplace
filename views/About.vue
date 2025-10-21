<template>
  <h1>About</h1>
  <p>This is the about page.</p>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';
const store = useAppStore();
</script>

<style scoped>
.card { margin-top: 1rem; }
</style>
