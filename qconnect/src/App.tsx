import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Badges from './pages/Badges';

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
// This helper component connects the URL ID to your SurahView
const SurahReaderWrapper = () => {
  const { surahId } = useParams();
  return <SurahView chapterId={Number(surahId)} />;
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
      <Routes>
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/home" replace />} />
        <Route path="/onboarding" element={session ? <Onboarding /> : <Navigate to="/" replace />} />
        <Route path="/home" element={session ? <Home /> : <Navigate to="/" replace />} />
        <Route path="/badges" element={session ? <Badges /> : <Navigate to="/" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/callback" element={<QfCallback />} />
        <Route path="/quest" element={session ? <Quest /> : <Navigate to="/" replace />} />
        <Route path="/quest/play/:levelId" element={session ? <QuestPlay /> : <Navigate to="/" replace />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/" replace />} />
        <Route path="/bookmarks" element={session ? <MyBookmarks /> : <Navigate to="/" replace />} />
        <Route path="/search" element={session ? <WisdomSearch /> : <Navigate to="/" replace />} />
        
        {/* The Surah List Page */}
        <Route path="/quran" element={session ? <Quran /> : <Navigate to="/" replace />} />
        
        {/* The Actual Reading Page (e.g., /quran/18) */}
        <Route path="/quran/:surahId" element={session ? <SurahReaderWrapper /> : <Navigate to="/" replace />} />

        {/* --- ADDED: The Reflections History Route --- */}
        <Route path="/reflections" element={session ? <Reflections /> : <Navigate to="/" replace />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;