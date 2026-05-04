import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

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
import Reminders from './pages/Reminders';
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

function App() {
  const [session, setSession] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async (currentSession: any) => {
      if (currentSession) {
        const { data } = await supabase.from('user_profiles').select('role').eq('id', currentSession.user.id).maybeSingle();
        setIsOnboarded(!!data?.role);
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
        <Route path="/reminders" element={session ? (isOnboarded ? <Reminders /> : <Navigate to="/onboarding" replace />) : <Navigate to="/" replace />} />

        {/* Public / Utility */}
        <Route path="/callback" element={<QfCallback />} />
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