import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Sprout, 
  Compass, Sparkles, Cloud, Anchor, Sun, Shield, 
  Moon, Zap, Leaf, Check
} from 'lucide-react';

const themes = [
  { id: 'patience', label: 'Patience', icon: <Cloud size={20} /> },
  { id: 'gratitude', label: 'Gratitude', icon: <Sparkles size={20} /> },
  { id: 'wisdom', label: 'Wisdom', icon: <Compass size={20} /> },
  { id: 'peace', label: 'Peace', icon: <Sprout size={20} /> },
  { id: 'strength', label: 'Strength', icon: <Zap size={20} /> },
  { id: 'guidance', label: 'Guidance', icon: <Anchor size={20} /> },
  { id: 'hope', label: 'Hope', icon: <Sun size={20} /> },
  { id: 'protection', label: 'Protection', icon: <Shield size={20} /> },
  { id: 'reflection', label: 'Reflection', icon: <Moon size={20} /> },
  { id: 'growth', label: 'Growth', icon: <Leaf size={20} /> },
];

const Onboarding: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          role: 'user', 
          themes: [selectedTheme],
          updated_at: new Date() 
        });
      if (!error) {
        window.location.assign('/home');
      } else {
        console.error(error);
        setErrorMsg(error.message || JSON.stringify(error));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col font-body transition-all duration-700">
      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 shadow-sm hover:border-primary/30 text-primary transition-all active:scale-95 shrink-0"
              aria-label="Sign Out"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Setup</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Your Intention</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Required</span>
          </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 max-w-6xl mx-auto w-full pb-20">
        

          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-secondary mb-3">Select your core intention</h2>
              <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">Select a theme that syncs to your account to receive daily contextual nudges. We will deliver verses and reminders aligned exactly with this intention.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {themes.map((t) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`aspect-square rounded-[32px] flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ${
                      isActive 
                      ? 'border-primary bg-primary text-white shadow-xl scale-105' 
                      : 'border-white bg-white hover:border-neutral-100'
                    }`}
                  >
                    <div className={isActive ? 'text-white' : 'text-primary'}>
                      {t.icon}
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-16 flex flex-col items-center justify-center">
              {errorMsg && (
                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium w-full max-w-md text-center">
                    <p className="font-bold mb-1">Database Error:</p>
                    <p className="font-light">{errorMsg}</p>
                 </div>
              )}
              <button
                onClick={handleComplete}
                disabled={!selectedTheme || loading}
                className={`px-16 py-5 rounded-full font-bold text-lg transition-all duration-500 shadow-2xl ${
                  selectedTheme && !loading
                  ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 active:scale-95'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? 'Preparing Journey...' : 'Finish'}
              </button>
            </div>
        </div>
      </main>
      
      {/* --- PROGRESS BAR BOTTOM --- */}
       <div className="fixed bottom-0 left-0 w-full h-1 bg-neutral-100">
         <div className="h-full bg-primary transition-all duration-1000" style={{ width: `100%` }} />
       </div>
    </div>
  );
};

export default Onboarding;