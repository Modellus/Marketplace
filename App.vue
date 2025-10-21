<template>
  <div v-if="!authStore.isAuthenticated" class="auth-shell">
    <RouterView />
  </div>
  <DxDrawer
    v-else
    :opened="true"
    position="left"
    :shading="false"
    :close-on-outside-click="false"
    :height="'100vh'"
    :width="240"
  >
    <template #template>
      <DxList
        :items="menuItems"
        selection-mode="single"
      >
        <template #item="{ data }">
          <div style="display: flex; align-items: center;">
            <i :class="['fa-solid', data.icon]" style="margin-right: 10px;"></i>
            <span>{{ data.text }}</span>
          </div>
        </template>
      </DxList>
    </template>
    <div style="margin-left: 10px;">
      <div class="app">
        <NavBar />
        <main class="main">
          <RouterView />
        </main>
      </div>
    </div>
  </DxDrawer>
</template>

<script setup>
import 'devextreme/dist/css/dx.light.css';
import '@fortawesome/fontawesome-free/css/all.css';
import NavBar from './components/NavBar.vue';
import DxDrawer from 'devextreme-vue/drawer';
import DxList from 'devextreme-vue/list';
import { useAuthStore } from './stores/authStore';

const menuItems = [
  { text: 'Discover', icon: 'fa-compass' },
  { text: 'Favorites', icon: 'fa-star' },
  { text: 'Education Level', icon: 'fa-graduation-cap' },
  { text: 'Categories', icon: 'fa-list' },
  { text: 'Library', icon: 'fa-book' }
];

const authStore = useAuthStore();
</script>

<style>
:root {
  --c-bg: #0b0c10;
  --c-fg: #e5e7eb;
  --c-muted: #9ca3af;
  --c-link: #60a5fa;
  --c-border: #1f2937;
}
.app {
  min-height: 100dvh;
  background: var(--c-bg);
  color: var(--c-fg);
}
.auth-shell {
  min-height: 100dvh;
  background: var(--c-bg);
  color: var(--c-fg);
}
.main { padding: 1rem; }
a { color: var(--c-link); }
</style>
