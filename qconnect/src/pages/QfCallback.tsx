import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeQfCodeForToken } from '../services/qfOAuth';
import { supabase } from '../lib/supabaseClient';

export default function QfCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

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
        // Exchange the OAuth code for tokens
        const result = await exchangeQfCodeForToken(code, redirectUri);
        console.log('[QfCallback] Token exchange result:', result);
        console.log('[QfCallback] access_token stored:', localStorage.getItem('qf_access_token')?.substring(0, 40) + '...');
        console.log('[QfCallback] refresh_token stored:', !!localStorage.getItem('qf_refresh_token'));
        localStorage.removeItem('qf_oauth_state');

        // Check if user needs onboarding BEFORE navigating
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role, themes')
            .eq('id', user.id)
            .maybeSingle();

          // If no profile or missing required fields, go to onboarding
          if (!profile || !profile.role || !profile.themes || profile.themes.length === 0) {
            console.log('[QfCallback] Profile incomplete, redirecting to onboarding');
            navigate('/onboarding', { replace: true });
          } else {
            console.log('[QfCallback] Profile complete, redirecting to home');
            navigate('/home', { replace: true });
          }
        } else {
          // No user found, send to home (which will handle auth redirect)
          navigate('/home', { replace: true });
        }
      } catch (e: any) {
        console.error('[QfCallback] Error:', e);
        setError(e?.message || 'Authentication failed.');
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F5F7] px-6">
      <div className="bg-white max-w-md w-full rounded-[32px] p-8 shadow-xl border border-neutral-100 text-center">
        <h1 className="text-2xl font-display text-[#00695C] mb-2">Connecting Quran Account</h1>
        {error ? (
          <div className="space-y-4">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:shadow-lg transition-all"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Finishing sign-in…</p>
        )}
      </div>
    </div>
  );
}