const SCRIPT_ID = 'google-identity-services';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loadPromise;

export function loadGoogleIdentity() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity requires a browser environment.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID);
    if (script && window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.accounts.id);
      script.onerror = () => {
        loadPromise = undefined;
        reject(new Error('Failed to load Google Identity Services.'));
      };
      document.head.appendChild(script);
    } else {
      script.onload = () => resolve(window.google.accounts.id);
      script.onerror = () => {
        loadPromise = undefined;
        reject(new Error('Failed to load Google Identity Services.'));
      };
    }
  });

  return loadPromise;
}

export async function initGoogleIdentity(callback) {
  const accountsId = await loadGoogleIdentity();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing Google client id. Set VITE_GOOGLE_CLIENT_ID in your environment.');
  }
  accountsId.initialize({
    client_id: clientId,
    callback,
    auto_select: false,
    ux_mode: 'popup'
  });
  return accountsId;
}
