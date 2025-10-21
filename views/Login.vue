<template>
  <section class="login-page">
    <div class="login-card">
      <h1>Sign in to Marketplace</h1>
      <p class="hint">Use your Google account to access the marketplace experience.</p>
      <GoogleSignInButton @success="handleSuccess" @error="handleError" />
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GoogleSignInButton from '../components/GoogleSignInButton.vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const redirectPath = computed(() => {
  const destination = route.query.redirect;
  if (typeof destination === 'string' && destination.trim()) return destination;
  return '/';
});

if (authStore.isAuthenticated) {
  router.replace(redirectPath.value);
}

const errorMessage = computed(() => authStore.authError);

function handleSuccess() {
  router.replace(redirectPath.value);
}

function handleError() {
  // authStore already captures the message; computed errorMessage will update.
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  background: radial-gradient(circle at top, rgba(96, 165, 250, 0.15), transparent 45%), var(--c-bg);
  color: var(--c-fg);
}
.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.45);
  text-align: center;
  max-width: 360px;
}
.login-card h1 {
  font-size: 1.5rem;
  margin: 0;
}
.hint {
  margin: 0;
  color: var(--c-muted);
  font-size: 0.95rem;
}
.error {
  color: #f87171;
  margin: 0;
  font-size: 0.85rem;
}
</style>

