import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, GraduationCap, Briefcase, Heart, Sprout, 
  Compass, Sparkles, Cloud, Anchor, Sun, Shield, 
  Moon, Zap, Leaf, Check
} from 'lucide-react';

const roles = [
  { 
    id: 'student', 
    label: 'Student', 
    description: 'Focus on focus, learning, and balanced growth.',
    icon: <GraduationCap size={28} /> 
  },
  { 
    id: 'worker', 
    label: 'Professional', 
    description: 'Manage stress and find peace in your career.',
    icon: <Briefcase size={28} /> 
  },
  { 
    id: 'parent', 
    label: 'Parent', 
    description: 'Guided reflections for leading a home with grace.',
    icon: <Heart size={28} /> 
  },
];

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
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
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
          role: selectedRole, 
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
      <header className="w-full px-8 py-10 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button 
            onClick={async () => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                await supabase.auth.signOut();
                navigate('/');
              }
            }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-neutral-100 shadow-sm hover:border-primary/30 transition-all active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="text-primary" />
          </button>
          <h1 className="text-xl font-bold text-secondary">Step {step}: <span className="font-light italic text-neutral-400">{step === 1 ? 'Your Role' : 'Your Intention'}</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Required</span>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 max-w-6xl mx-auto w-full pb-20">
        
        {step === 1 ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-secondary mb-3">Welcome! What is your current life season?</h2>
              <p className="text-neutral-400 max-w-lg mx-auto leading-relaxed">We use your role to tailor your daily gamified quests and micro-reflections, making sure they fit perfectly into your daily rhythm.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {roles.map((r) => {
                const isActive = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`choice-card relative group ${
                      isActive 
                      ? 'border-primary bg-white shadow-2xl shadow-primary/5 py-12' 
                      : 'border-white bg-white/50 hover:bg-white hover:border-neutral-100 py-10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-6 right-6 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <Check size={14} className="text-white" strokeWidth={4} />
                      </div>
                    )}
                    
                    <div className={`w-20 h-20 rounded-[24px] mb-8 flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/20' : 'bg-neutral-50 text-neutral-400 group-hover:bg-primary/5 group-hover:text-primary'
                    }`}>
                      {r.icon}
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-3 transition-colors ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {r.label}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed text-center px-4 transition-colors ${isActive ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-20 flex justify-center">
                 <button 
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  className={`px-16 py-5 rounded-full font-bold text-lg transition-all duration-500 shadow-2xl ${
                    selectedRole 
                    ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 active:scale-95' 
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  Continue
                </button>
            </div>
          </div>
        ) : (
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
        )}
      </main>

      {/* --- PROGRESS BAR BOTTOM --- */}
       <div className="fixed bottom-0 left-0 w-full h-1 bg-neutral-100">
         <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(step / 2) * 100}%` }} />
       </div>
    </div>
  );
};

export default Onboarding;