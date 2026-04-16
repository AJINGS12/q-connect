import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeQfCodeForToken } from '../services/qfOAuth';

export default function QfCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false); // prevent React StrictMode double-invoke

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const expectedState = localStorage.getItem('qf_oauth_state');

      if (!code) {
        setError('Missing code.');
        return;
      }
      if (!state || !expectedState || state !== expectedState) {
        setError('Invalid state.');
        return;
      }

      const redirectUri = `${window.location.origin}/callback`;
      try {
        const result = await exchangeQfCodeForToken(code, redirectUri);
        console.log('[QfCallback] Token exchange result:', result);
        console.log('[QfCallback] access_token stored:', localStorage.getItem('qf_access_token')?.substring(0, 40) + '...');
        console.log('[QfCallback] refresh_token stored:', !!localStorage.getItem('qf_refresh_token'));
        localStorage.removeItem('qf_oauth_state');
        navigate('/home', { replace: true });
      } catch (e: any) {
        console.error('[QfCallback] Token exchange error:', e);
        setError(e?.message || 'Token exchange failed.');
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F5F7] px-6">
      <div className="bg-white max-w-md w-full rounded-[32px] p-8 shadow-xl border border-neutral-100 text-center">
        <h1 className="text-2xl font-display text-[#00695C] mb-2">Connecting Quran Account</h1>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <p className="text-sm text-neutral-500">Finishing sign-in…</p>
        )}
      </div>
    </div>
  );
}

