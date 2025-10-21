import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Login from './views/Login.vue';
import { useAuthStore } from './stores/authStore';

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { title: 'Sign In', requiresAuth: false } },
  { path: '/', name: 'home', component: Home, meta: { title: 'Home', requiresAuth: true } },
  { path: '/about', name: 'about', component: About, meta: { title: 'About', requiresAuth: true } },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./views/NotFound.vue'),
    meta: { title: 'Not Found', requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta?.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    const redirectTarget = to.fullPath && to.fullPath !== '/login' ? to.fullPath : undefined;
    return {
      name: 'login',
      query: redirectTarget ? { redirect: redirectTarget } : undefined
    };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' && to.query.redirect.trim()
      ? to.query.redirect
      : '/';
    return redirect;
  }

  return true;
});

// Update document title per-route
router.afterEach((to) => {
  const baseTitle = 'Marketplace';
  const page = to.meta && to.meta.title ? `${to.meta.title} · ${baseTitle}` : baseTitle;
  if (typeof document !== 'undefined') document.title = page;
});

export default router;
