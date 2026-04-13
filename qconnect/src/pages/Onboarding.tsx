import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, GraduationCap, Briefcase, Heart, Sprout, 
  Compass, Sparkles, Cloud, Anchor, Sun, Shield, 
  Moon, Zap, Leaf 
} from 'lucide-react';

const roles = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={24} /> },
  { id: 'worker', label: 'Professional', icon: <Briefcase size={24} /> },
  { id: 'parent', label: 'Parent', icon: <Heart size={24} /> },
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
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          role: selectedRole, 
          theme_preference: selectedTheme,
          updated_at: new Date() 
        });
      if (!error) navigate('/home');
      else console.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center font-body text-secondary pb-12">
      {/* --- NAVIGATION HEADER --- */}
      <div className="w-full max-w-2xl px-6 pt-8 flex items-center justify-between">
        <div className="w-20">
          {step > 1 && (
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-neutral-400 hover:text-primary transition-all group"
            >
              <div className="bg-white shadow-sm border border-neutral-100 p-2 rounded-xl group-hover:border-primary/30">
                <ChevronLeft size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
            </button>
          )}
        </div>
        
        <div className="flex-grow max-w-[120px] h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="w-20 text-right">
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
            0{step} / 02
          </span>
        </div>
      </div>

      <div className="max-w-2xl w-full px-6 mt-12">
        {step === 1 ? (
          <div className="animate-fadeIn space-y-10">
            <div className="text-center">
              <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase block mb-3">Identity</span>
              <h1 className="text-4xl font-display text-primary">How do you move <br/> <span className="italic font-light">through the world?</span></h1>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRole(r.id); setStep(2); }}
                  className="w-full flex items-center gap-5 p-6 bg-white border border-neutral-100 rounded-[28px] shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="bg-neutral-50 p-4 rounded-2xl text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {r.icon}
                  </div>
                  <span className="text-xl font-display text-secondary">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn space-y-10">
            <div className="text-center">
              <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase block mb-3">Intention</span>
              <h1 className="text-4xl font-display text-primary">What does your soul <br/> <span className="italic font-light">seek today?</span></h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-[32px] border-2 transition-all duration-300 gap-2 ${
                    selectedTheme === t.id 
                    ? 'border-primary bg-primary text-white shadow-xl scale-[1.05]' 
                    : 'border-white bg-white text-secondary hover:border-neutral-100 shadow-sm'
                  }`}
                >
                  <div className={selectedTheme === t.id ? 'text-white' : 'text-primary'}>
                    {t.icon}
                  </div>
                  <span className="font-display text-[13px]">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="max-w-md mx-auto pt-4">
              <button
                onClick={handleComplete}
                disabled={!selectedTheme || loading}
                className={`w-full py-6 rounded-full font-bold text-lg shadow-2xl transition-all ${
                  selectedTheme && !loading
                  ? 'bg-primary text-white hover:shadow-primary/40 active:scale-95'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Preparing Sanctuary...' : 'Begin My Journey'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;