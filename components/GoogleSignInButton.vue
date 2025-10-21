<template>
  <div class="google-sign-in" :class="{ 'is-loading': authStore.isAuthenticating }">
    <div ref="buttonHost" class="google-button-host"></div>
    <button v-if="authStore.isAuthenticating" class="loading-button" disabled>
      Signing in...
    </button>
    <p v-if="localError" class="error">{{ localError }}</p>
    <p v-else-if="authStore.authError" class="error">{{ authStore.authError }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { exchangeGoogleIdToken } from '../services/apiClient';
import { initGoogleIdentity } from '../services/googleIdentity';

const emit = defineEmits(['success', 'error']);

const authStore = useAuthStore();
const buttonHost = ref(null);
const localError = ref('');

let googleAccounts;
let buttonRendered = false;

async function handleCredentialResponse(response) {
  if (!response?.credential) {
    authStore.setAuthError('Google sign-in did not return a credential.');
    return;
  }

  try {
    authStore.setAuthenticating(true);
    const result = await exchangeGoogleIdToken(response.credential);
    authStore.setAuthResult(result);
    emit('success', result);
  } catch (error) {
    const message = error?.message || 'Authentication failed.';
    authStore.setAuthError(message);
    emit('error', message);
  } finally {
    authStore.setAuthenticating(false);
  }
}

async function renderGoogleButton() {
  if (typeof window === 'undefined' || !buttonHost.value) return;
  localError.value = '';

  try {
    googleAccounts = await initGoogleIdentity(handleCredentialResponse);
    if (!buttonRendered) {
      buttonHost.value.innerHTML = '';
      googleAccounts.renderButton(buttonHost.value, {
        theme: 'filled_blue',
        size: 'medium',
        shape: 'pill',
        text: 'signin_with'
      });
      buttonRendered = true;
    }
    googleAccounts.prompt();
  } catch (error) {
    localError.value = error?.message || 'Google Sign-In is unavailable.';
    emit('error', localError.value);
  }
}

onMounted(() => {
  renderGoogleButton();
});

onBeforeUnmount(() => {
  if (googleAccounts?.cancel) {
    googleAccounts.cancel();
  }
  if (buttonHost.value) {
    buttonHost.value.innerHTML = '';
  }
});
</script>

<style scoped>
.google-sign-in {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.google-sign-in.is-loading {
  pointer-events: none;
  opacity: 0.7;
}
.google-button-host {
  display: inline-flex;
}
.loading-button {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.25rem;
  border-radius: 999px;
  border: none;
  background: #4285f4;
  color: #ffffff;
  font-weight: 600;
  cursor: progress;
}
.error {
  color: #f87171;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: center;
}
</style>
