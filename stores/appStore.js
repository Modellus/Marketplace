import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    count: 0,
    theme: 'dark'
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    increment(step = 1) {
      this.count += step;
    },
    reset() {
      this.count = 0;
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
    }
  }
});
