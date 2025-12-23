const apiBase = 'https://modellus-api.interactivebook.workers.dev';
const googleClientId = '616832441203-a45kghte7c05vdkj5ri5ejp8qu81vcae.apps.googleusercontent.com';
const sessionKey = 'mp.session';
const filters = [
  { key: 'all', text: 'All', query: '' },
  { key: 'favorite', text: 'Favorite', query: 'favorite' },
  { key: 'sciences', text: 'Sciences', query: 'sciences' },
  { key: 'education', text: 'Education Levels', query: 'education' }
];
if (typeof window !== 'undefined' && window.DevExpress?.config) {
  DevExpress.config({
    licenseKey: 'ewogICJmb3JtYXQiOiAxLAogICJjdXN0b21lcklkIjogImNmOWZhNjAzLTI4ZTAtMTFlMi05NWQwLTAwMjE5YjhiNTA0NyIsCiAgIm1heFZlcnNpb25BbGxvd2VkIjogMjUxCn0=.HCqYKF15Krg++10hQyJyCeml3sygMFCr47zMJkW4jeXktXehF3um5KXOxJIzXPSawem8oGxQVUIbMFNH8rwoA5esgYplJhs9KN/N30BkHJ+P6x1d0GZFoj/KEteI8kttNyDLPA=='
  });
}

const els = {
  pageLogin: document.getElementById('page-login'),
  pageModels: document.getElementById('page-models'),
  navLogin: document.getElementById('nav-login'),
  navModels: document.getElementById('nav-models'),
  navLogout: document.getElementById('nav-logout'),
  userChip: document.getElementById('user-chip'),
  loginStatus: document.getElementById('login-status'),
  status: document.getElementById('status'),
  toolbar: document.getElementById('toolbar'),
  drawerShell: document.getElementById('drawer-shell'),
  drawer: document.getElementById('drawer'),
  cardView: document.getElementById('models-card-view'),
  googleSignin: document.getElementById('google-signin')
};

let cardViewInstance = null;
let drawerInstance = null;
let filterListInstance = null;
let toolbarInstance = null;

function readSession() {
  try {
    const raw = localStorage.getItem(sessionKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read session', err);
    return null;
  }
}

function saveSession(payload) {
  localStorage.setItem(sessionKey, JSON.stringify(payload));
}

function clearSession() {
  localStorage.removeItem(sessionKey);
}

function showPage(page) {
  const isLogin = page === 'login';
  els.pageLogin.classList.toggle('hidden', !isLogin);
  els.pageModels.classList.toggle('hidden', isLogin);
  els.navLogout.classList.toggle('hidden', isLogin);
  els.userChip.textContent = isLogin ? 'Signed out' : `Signed in as ${state.session?.name || 'Guest'}`;
}

function setStatus(message, isError = false) {
  els.status.textContent = message || '';
  els.status.classList.toggle('error', Boolean(isError));
}

function setLoginStatus(message, isError = false) {
  els.loginStatus.textContent = message || '';
  els.loginStatus.classList.toggle('error', Boolean(isError));
}

function ensureCardView() {
  if (cardViewInstance || !els.cardView || !window.DevExpress?.ui) return;
  const CardView = DevExpress.ui.dxCardView;
  cardViewInstance = new CardView(els.cardView, {
    dataSource: [],
    height: '100%',
    showBorders: false,
    focusStateEnabled: false,
    hoverStateEnabled: false,
    allowColumnReordering: false,
    allowColumnResizing: false,
    columnHidingEnabled: true,
    colCount: 3,
    colCountByScreen: {
      lg: 3,
      md: 2,
      sm: 1,
      xs: 1
    },
    columns: [
      { dataField: 'title', caption: 'Title' },
      { dataField: 'description', caption: 'Description' },
      { dataField: 'type', caption: 'Type' },
      { dataField: 'status', caption: 'Status' },
      { dataField: 'complexity', caption: 'Complexity' },
      { dataField: 'usageCount', caption: 'Usage' }
    ],
    cardTemplate: (cardData, cardElement) => {
      const host = cardElement?.get ? cardElement.get(0) : cardElement;
      const data = cardData?.card?.data || cardData || {};
      if (!host) 
        return;
      host.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'card-tile';
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = data.title || data.name || 'Untitled model';
      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = data.description || data.subtitle || 'No description provided.';
      const badges = document.createElement('div');
      badges.className = 'card-badges';
      const badge = (label) => {
        const span = document.createElement('span');
        span.className = 'card-badge';
        span.textContent = label;
        return span;
      };
      if (data.type) 
        badges.appendChild(badge(`Type: ${data.type}`));
      if (data.status) 
        badges.appendChild(badge(`Status: ${data.status}`));
      if (data.complexity) 
        badges.appendChild(badge(`Level: ${data.complexity}`));
      badges.appendChild(badge(`Usage: ${data.usageCount ?? 0}`));
      card.append(title, desc, badges);
      host.appendChild(card);
    }
  });
}

function renderModels(items) {
  ensureCardView();
  if (cardViewInstance) {
    cardViewInstance.option('dataSource', items);
  }
  if (!items.length) {
    setStatus('No models found.');
  }
}

async function loadModels(filter = state.filter) {
  setStatus('Loading models…');
  try {
    const targetFilter = filter || filters[0];
    state.filter = targetFilter;
    const headers = {};
    if (state.session?.token) {
      headers.Authorization = `Bearer ${state.session.token}`;
    }
    const url = new URL(`${apiBase}/models`);
    if (targetFilter.key !== 'all' && targetFilter.query) {
      url.searchParams.set('filter', targetFilter.query);
    }
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    setStatus(items.length ? '' : 'No models found.');
    renderModels(items);
  } catch (err) {
    console.error(err);
    setStatus(err?.message || 'Failed to load models.', true);
    renderModels([]);
  }
}

function initDrawer() {
  if (drawerInstance || !els.drawer || !window.DevExpress?.ui) return;
  const listHost = document.createElement('div');
  drawerInstance = new DevExpress.ui.dxDrawer(els.drawer, {
    opened: true,
    minSize: 220,
    maxSize: 260,
    revealMode: 'expand',
    openedStateMode: 'shrink',
    template: () => listHost,
    shading: false
  });
  filterListInstance = new DevExpress.ui.dxList(listHost, {
    items: filters,
    selectionMode: 'single',
    selectedItem: filters[0],
    focusStateEnabled: false,
    hoverStateEnabled: true,
    onItemClick: (e) => {
      if (e?.itemData) {
        state.filter = e.itemData;
        loadModels(e.itemData);
      }
    }
  });
}

function refreshFilterSelection() {
  if (filterListInstance && state.filter) {
    filterListInstance.option('selectedItem', state.filter);
  }
}

function toggleDrawer() {
  if (!drawerInstance || !els.drawerShell) return;
  const isOpen = drawerInstance.option('opened');
  drawerInstance.option('opened', !isOpen);
  els.drawerShell.classList.toggle('drawer-collapsed', isOpen);
}

function initToolbar() {
  if (toolbarInstance || !els.toolbar || !window.DevExpress?.ui) return;
  toolbarInstance = new DevExpress.ui.dxToolbar(els.toolbar, {
    items: [
      {
        widget: 'dxButton',
        options: {
          onClick: toggleDrawer,
          elementAttr: { 'aria-label': 'Toggle Filters' },
          template: (_, contentElement) => {
            const host = contentElement?.get ? contentElement.get(0) : contentElement;
            if (!host) return;
            host.innerHTML = '';
            const iconEl = document.createElement('i');
            iconEl.className = 'fa-regular fa-sidebar';
            iconEl.style.fontSize = '16px';
            host.appendChild(iconEl);
          }
        },
        location: 'before'
      },
      {
        locateInMenu: 'never',
        location: 'after'
      }
    ]
  });
}

function handleLogout() {
  state.session = null;
  clearSession();
  showPage('login');
}

function onGoogleCredential(response) {
  const idToken = response?.credential;
  if (!idToken) {
    setLoginStatus('Google sign-in failed. No credential returned.', true);
    return;
  }
  exchangeGoogleToken(idToken);
}

async function exchangeGoogleToken(idToken) {
  setLoginStatus('Signing you in…');
  try {
    const res = await fetch(`${apiBase}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) throw new Error(`Auth failed (${res.status})`);
    const data = await res.json();
    const { token, user } = data || {};
    state.session = {
      token: token || idToken,
      name: user?.name || user?.givenName || 'Signed in',
      email: user?.email || ''
    };
    saveSession(state.session);
    setLoginStatus('');
    showPage('models');
    loadModels();
  } catch (err) {
    console.error(err);
    setLoginStatus(err?.message || 'Google sign-in failed.', true);
  }
}

function initGoogleSignIn() {
  if (!googleClientId) {
    setLoginStatus('Missing GOOGLE_CLIENT_ID; Google Sign-In is disabled.', true);
    return;
  }
  /* global google */
  const render = () => {
    try {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: onGoogleCredential
      });
      google.accounts.id.renderButton(els.googleSignin, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320
      });
    } catch (err) {
      console.error(err);
      setLoginStatus('Failed to initialize Google Sign-In.', true);
    }
  };

  if (window.google?.accounts?.id) {
    render();
  } else {
    window.addEventListener('load', render, { once: true });
  }
}

function wireEvents() {
  els.navLogin.addEventListener('click', () => showPage('login'));
  els.navModels.addEventListener('click', () => {
    if (!state.session) {
      showPage('login');
      return;
    }
    showPage('models');
    initDrawer();
    initToolbar();
    refreshFilterSelection();
    loadModels();
  });
  els.navLogout.addEventListener('click', handleLogout);
}

const state = {
  session: readSession(),
  filter: filters[0]
};

function init() {
  wireEvents();
  initGoogleSignIn();
  if (state.session) {
    showPage('models');
    initDrawer();
    initToolbar();
    refreshFilterSelection();
    loadModels();
  } else {
    showPage('login');
  }
}

init();
