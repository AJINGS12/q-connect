const QF_OAUTH_BASE =
  (import.meta.env.VITE_QURAN_OAUTH_BASE as string | undefined) ||
  'https://prelive-oauth2.quran.foundation';

// --- CRITICAL: MATCH THIS EXACTLY WITH YOUR DEVELOPER PORTAL ---
// If the portal has '.../callback/', use a slash. If it has '.../callback', NO slash.
const QF_REDIRECT_URI = "https://q-connect.vercel.app/callback";

// In the browser, token exchange must go through the Vite proxy to avoid CORS.
const QF_TOKEN_BASE =
  typeof window !== 'undefined' ? '/qf-oauth' : QF_OAUTH_BASE;

const QF_CLIENT_ID = import.meta.env.VITE_QURAN_CLIENT_ID as string | undefined;
const QF_CLIENT_SECRET = import.meta.env.VITE_QURAN_CLIENT_SECRET as string | undefined;

const ACCESS_TOKEN_KEY = 'qf_access_token';
const REFRESH_TOKEN_KEY = 'qf_refresh_token';

export const getQfAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearQfAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Silently refresh the access token using the stored refresh token.
export const refreshQfToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken || !QF_CLIENT_ID || !QF_CLIENT_SECRET) return null;

  try {
    const res = await fetch(`${QF_TOKEN_BASE}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${QF_CLIENT_ID}:${QF_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: 'openid offline_access bookmark streak',
      }),
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
  if (!QF_CLIENT_ID) throw new Error('Missing VITE_QURAN_CLIENT_ID');
  const state = crypto.randomUUID();
  localStorage.setItem('qf_oauth_state', state);

  const scope = encodeURIComponent('openid offline_access bookmark streak');
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
  if (!QF_CLIENT_ID || !QF_CLIENT_SECRET) {
    throw new Error('Missing Quran OAuth client credentials');
  }

  const res = await fetch(`${QF_TOKEN_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${QF_CLIENT_ID}:${QF_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: finalRedirectUri,
      scope: 'openid offline_access bookmark streak',
    }),
  });

  const json = await res.json();
  console.log('[QF OAuth] Token exchange response status:', res.status);
  console.log('[QF OAuth] Token exchange response:', JSON.stringify(json));
  if (!res.ok) {
    console.error('QF token exchange failed', json);
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

