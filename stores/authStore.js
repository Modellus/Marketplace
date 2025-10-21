import { defineStore } from 'pinia';

const STORAGE_KEY = 'modellus.auth';
let expiryTimer;

function persistState(payload) {
  if (typeof window === 'undefined') return;
  if (!payload) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function readPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[authStore] Failed to parse persisted auth state', error);
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    tokenType: 'Bearer',
    expiresAt: null,
    user: null,
    isAuthenticating: false,
    authError: null
  }),
  getters: {
    isAuthenticated: (state) => {
      if (!state.token || !state.expiresAt) return false;
      return new Date(state.expiresAt).getTime() > Date.now();
    },
    authorizationHeader: (state) => {
      if (!state.token) return null;
      const prefix = state.tokenType || 'Bearer';
      return `${prefix} ${state.token}`;
    },
    remainingLifetimeMs: (state) => {
      if (!state.expiresAt) return 0;
      return Math.max(new Date(state.expiresAt).getTime() - Date.now(), 0);
    }
  },
  actions: {
    hydrate() {
      const persisted = readPersistedState();
      if (!persisted) return;
      const { token, tokenType, expiresAt, user } = persisted;
      if (!token || !expiresAt) {
        this.clearAuth();
        return;
      }
      const expiresMs = new Date(expiresAt).getTime();
      if (Number.isNaN(expiresMs) || expiresMs <= Date.now()) {
        this.clearAuth({ reason: 'Session expired.' });
        return;
      }
      this.token = token;
      this.tokenType = tokenType || 'Bearer';
      this.expiresAt = new Date(expiresMs).toISOString();
      this.user = user || null;
      this.authError = null;
      this.scheduleExpiryTimer();
    },
    setAuthResult(result) {
      if (!result) {
        this.clearAuth();
        return;
      }

      const { token, tokenType = 'Bearer', expiresIn, user } = result;
      if (!token || !expiresIn) {
        console.warn('[authStore] Missing token or expiresIn from auth response');
        this.clearAuth();
        return;
      }

      const expiresAt = new Date(Date.now() + Number(expiresIn) * 1000).toISOString();

      this.token = token;
      this.tokenType = tokenType || 'Bearer';
      this.expiresAt = expiresAt;
      this.user = user || null;
      this.authError = null;

      persistState({
        token: this.token,
        tokenType: this.tokenType,
        expiresAt: this.expiresAt,
        user: this.user
      });

      this.scheduleExpiryTimer();
    },
    clearAuth({ reason } = {}) {
      this.token = null;
      this.tokenType = 'Bearer';
      this.expiresAt = null;
      this.user = null;
      this.isAuthenticating = false;
      this.authError = reason || null;

      persistState(null);
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = undefined;
      }
    },
    setAuthenticating(isAuthenticating) {
      this.isAuthenticating = Boolean(isAuthenticating);
      if (isAuthenticating) this.authError = null;
    },
    setAuthError(errorMessage) {
      this.authError = errorMessage || 'Authentication failed.';
    },
    scheduleExpiryTimer() {
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = undefined;
      }
      if (!this.expiresAt) return;
      const expiresMs = new Date(this.expiresAt).getTime() - Date.now();
      if (Number.isNaN(expiresMs) || expiresMs <= 0) {
        this.clearAuth({ reason: 'Session expired.' });
        return;
      }

      const safetyWindowMs = 10_000;
      const timeoutMs = Math.max(expiresMs - safetyWindowMs, 0);

      expiryTimer = setTimeout(() => {
        this.clearAuth({ reason: 'Session expired. Please sign in again.' });
      }, timeoutMs);
    }
  }
});

