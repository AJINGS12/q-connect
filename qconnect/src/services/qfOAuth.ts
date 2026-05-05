const QF_OAUTH_BASE = 'https://oauth2.quran.foundation';

// --- DYNAMIC REDIRECT URI (Supports both Localhost and Vercel) ---
const getDynamicRedirectUri = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5173/callback';
  }
  // This MUST match exactly what was whitelisted for production:
  return 'https://qconnect-nine.vercel.app/callback';
};

const QF_REDIRECT_URI = getDynamicRedirectUri();

// --- TOKEN EXCHANGE (Now using our secure Backend API) ---
const QF_TOKEN_API = '/api/qf-token';

// PRODUCTION CLIENT ID (ID is safe to be public, SECRET is now only in backend)
const QF_CLIENT_ID = '39bc324a-e43d-4666-9b76-ff022d2169c6';

const ACCESS_TOKEN_KEY = 'qf_access_token';
const REFRESH_TOKEN_KEY = 'qf_refresh_token';

export const getQfAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearQfAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Silently refresh the access token using our backend API
export const refreshQfToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(QF_TOKEN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });

    const json = await res.json();
    if (!res.ok || !json?.access_token) {
       clearQfAccessToken();
       return null;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, json.access_token);
    if (json.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, json.refresh_token);
    return json.access_token;
  } catch {
    clearQfAccessToken();
    return null;
  }
};

export const startQfLogin = () => {
  if (!QF_CLIENT_ID) throw new Error('Missing QF_CLIENT_ID');
  const state = crypto.randomUUID();
  localStorage.setItem('qf_oauth_state', state);

  const scope = encodeURIComponent('openid bookmark');
  const url =
    `${QF_OAUTH_BASE}/oauth2/auth` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(QF_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(QF_REDIRECT_URI)}` +
    `&scope=${scope}` +
    `&state=${encodeURIComponent(state)}`;

  console.log('[OAuth] Redirecting with fixed URI:', QF_REDIRECT_URI);
  window.location.assign(url);
};

export const exchangeQfCodeForToken = async (code: string) => {
  const res = await fetch(QF_TOKEN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('QF token exchange failed via API', json);
    throw new Error(json?.error_description || 'Token exchange failed');
  }

  if (json?.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, json.access_token);
  }
  if (json?.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, json.refresh_token);
  }

  return json;
};
