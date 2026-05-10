import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { X, CheckCircle } from 'lucide-react';

// Page Imports
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Quran from './pages/Quran';
import SurahView from './pages/SurahView'; 
import Reflections from './pages/Reflections'; // Import the Reflections page
import Quest from './pages/Quest';
import QuestPlay from './pages/QuestPlay';
import Settings from './pages/Settings';
import QfCallback from './pages/QfCallback';
import MyBookmarks from './pages/MyBookmarks';
import WisdomSearch from './pages/WisdomSearch';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import InsightsPage from './pages/Insights';
import SocialGroups from './pages/SocialGroups';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// This helper component connects the URL ID to your SurahView
const SurahReaderWrapper = () => {
  const { surahId } = useParams();
  return <SurahView chapterId={Number(surahId)} />;
};

// Global scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Global popup for Quran account connection success
const QfSuccessPopup = () => {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (localStorage.getItem('qf_oauth_success') === 'true') {
      setShow(true);
      localStorage.removeItem('qf_oauth_success');
      
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!show) return null;

  return (
    <div className="fixed top-safe mt-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-primary/20 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-bold text-secondary">Quran Account Connected</h4>
          <p className="text-xs text-neutral-500 mt-1">You have connected your Quran account you can now bookmark.</p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async (currentSession: any) => {
      if (currentSession) {
        // Try fetching with tokens first
        const { data, error } = await supabase
          .from('user_profiles')
          .select('themes, qf_access_token, qf_refresh_token')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        // Fallback for before migration is run
        if (error && error.message.includes('qf_access_token')) {
          console.warn('[App] Migration needed for qf_access_token. Falling back.');
          const { data: fallbackData } = await supabase
            .from('user_profiles')
            .select('themes')
            .eq('id', currentSession.user.id)
            .maybeSingle();
          setIsOnboarded(!!(fallbackData?.themes && fallbackData.themes.length > 0));
        } else {
          setIsOnboarded(!!(data?.themes && data.themes.length > 0));
          
          // Sync tokens
          const localAccess = localStorage.getItem('qf_access_token');
          const localRefresh = localStorage.getItem('qf_refresh_token');

          if (data?.qf_access_token && data.qf_access_token !== 'DISCONNECTED' && !localAccess) {
            // Restore from Supabase to local
            localStorage.setItem('qf_access_token', data.qf_access_token);
            if (data.qf_refresh_token) {
              localStorage.setItem('qf_refresh_token', data.qf_refresh_token);
            }
          } else if (data?.qf_access_token === 'DISCONNECTED' && localAccess) {
            // User disconnected on another device
            localStorage.removeItem('qf_access_token');
            localStorage.removeItem('qf_refresh_token');
          } else if (data && !data.qf_access_token && localAccess) {
            // Migrate existing local tokens to Supabase
            await supabase.from('user_profiles').update({
              qf_access_token: localAccess,
              qf_refresh_token: localRefresh
            }).eq('id', currentSession.user.id);
          }
        }
        setSession(currentSession);
      } else {
        setSession(null);
        setIsOnboarded(false);
      }
      setLoading(false);
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session);
    });

    // Listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      checkUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F5F7]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <Router>
      <ScrollToTop />
      <QfSuccessPopup />
      <Routes>
        {/* Core Entry */}
        <Route path="/" element={!session ? <LandingPage /> : (isOnboarded ? <Navigate to="/home" replace /> : <Navigate to="/onboarding" replace />)} />
        <Route path="/landing" element={!session ? <LandingPage /> : <Navigate to="/" replace />} />
        
        {/* Onboarding - Must have session, but must NOT be fully onboarded (or allows them to stay if they are still doing it) */}
        <Route path="/onboarding" element={session ? <Onboarding /> : <Navigate to="/" replace />} />
        
        {/* Protected Routes - require session AND onboarding */}
        <Route path="/home" element={session ? (isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/quest" element={session ? (isOnboarded ? <Quest /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/quest/play/:levelId" element={session ? (isOnboarded ? <QuestPlay /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/settings" element={session ? (isOnboarded ? <Settings /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/bookmarks" element={session ? (isOnboarded ? <MyBookmarks /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/search" element={session ? (isOnboarded ? <WisdomSearch /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/quran" element={session ? (isOnboarded ? <Quran /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/quran/:surahId" element={session ? (isOnboarded ? <SurahReaderWrapper /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/reflections" element={session ? (isOnboarded ? <Reflections /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/insights" element={session ? (isOnboarded ? <InsightsPage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />
        <Route path="/social" element={session ? (isOnboarded ? <SocialGroups /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />

        {/* Public / Utility */}
        <Route path="/callback" element={<QfCallback />} />
        <Route path="/auth/callback" element={<QfCallback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallPrompt />
    </Router>
  );
}

export default App;