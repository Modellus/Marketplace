<template>
  <nav class="nav">
    <div class="nav-links">
      <RouterLink to="/" class="link">Home</RouterLink>
      <span class="sep">|</span>
      <RouterLink to="/about" class="link">About</RouterLink>
    </div>
    <div class="spacer" />
    <div class="auth" v-if="authStore.isAuthenticated">
      <span class="user-chip" :title="userEmail">
        <i class="fa-solid fa-user-circle"></i>
        {{ userDisplayName }}
      </span>
      <button class="logout" type="button" @click="logout">Sign out</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const userDisplayName = computed(() => authStore.user?.name || authStore.user?.givenName || authStore.user?.email || 'Signed in');
const userEmail = computed(() => authStore.user?.email || '');

function logout() {
  authStore.clearAuth();
  router.push({ name: 'login' });
}
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--c-border);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.link {
  color: var(--c-link);
  text-decoration: none;
}
.link.router-link-active {
  font-weight: 600;
}
.sep {
  color: var(--c-muted);
}
.spacer {
  flex: 1;
}
.auth {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.15);
  color: var(--c-link);
  font-weight: 600;
}
.logout {
  border: 1px solid var(--c-border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--c-fg);
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
}
.logout:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
