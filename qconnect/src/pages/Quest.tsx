import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Lock, BookOpen, Sparkles, CheckCircle2, Star, Zap, Info
} from 'lucide-react';
import QuestOnboarding from '../components/QuestOnboarding';

// --- IMAGE IMPORTS ---
import logoOfficial from '../assets/logo_official.png';

const Quest: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
        
        // Check if onboarding has been seen
        const hasSeenOnboarding = localStorage.getItem('has_seen_quest_onboarding');
        if (!hasSeenOnboarding) {
          setShowInfo(true);
          localStorage.setItem('has_seen_quest_onboarding', 'true');
        }
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center manuscript-canvas">
      <div className="w-8 h-8 border-4 border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
    </div>
  );

  const currentLvl = profile?.current_quest_level || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] pb-32 font-body transition-all duration-700">
      {showInfo && <QuestOnboarding onClose={() => setShowInfo(false)} />}

      {/* --- REFINED TOP BAR --- */}
      <nav className="glass-panel sticky top-0 z-50 py-4 px-6 border-none bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 md:gap-6">
             <button
               onClick={() => navigate('/home')}
               className="group w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-neutral-100 hover:border-primary/30 flex items-center justify-center text-primary shadow-sm transition-all active:scale-95 shrink-0"
             >
               <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
             </button>
             
             <div className="flex items-center gap-3 md:gap-4 border-l border-neutral-100 pl-3 md:pl-6">
                <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 bg-white border border-neutral-100 rounded-xl items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
                   <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] md:text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] leading-none">Learning Path</span>
                   <p className="text-xs md:text-sm font-bold text-secondary tracking-tight">Knowledge Quest</p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
            <button 
              onClick={() => setShowInfo(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-neutral-300 hover:text-primary transition-colors"
            >
              <Info className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="flex items-center gap-1 md:gap-2 bg-neutral-50/50 border border-neutral-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-white rounded-lg md:rounded-xl shadow-sm border border-neutral-50">
                 <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                 <span className="text-[10px] md:text-xs font-black text-secondary">{profile?.quest_hearts || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-white rounded-lg md:rounded-xl shadow-sm border border-neutral-50">
                 <Star className="w-3 h-3 md:w-4 md:h-4 text-primary fill-primary" />
                 <span className="text-[10px] md:text-xs font-black text-secondary">{profile?.quest_coins || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20 w-full">
        <div className="mb-20 space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Personal Growth</span>
          <h2 className="text-4xl font-display font-bold text-secondary tracking-tight">
            Knowledge <br/><span className="text-primary">Quest</span>
          </h2>
          <p className="text-neutral-400 font-light leading-relaxed max-w-lg">
            Track your movement through the Holy Quran. Complete each level to earn points and unlock new insights.
          </p>
        </div>

        {/* --- VERTICAL JOURNEY PILLAR --- */}
        <div className="ml-20 journey-pillar">
          {levels.map((lvl, index) => {
            const isUnlocked = lvl <= currentLvl;
            const isCurrent = lvl === currentLvl;
            const isCompleted = lvl < currentLvl;

            return (
              <div 
                key={lvl} 
                className={`mb-24 last:mb-0 transition-all duration-1000 animate-in fade-in slide-in-from-left-8`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                 <div className="level-card">
                    {/* Floating Level Number Indicator */}
                    <div className={`level-indicator ${isCurrent ? 'bg-primary text-white scale-110' : isCompleted ? 'bg-teal-50 text-primary' : 'bg-neutral-50 text-neutral-300 border-neutral-100'}`}>
                       {lvl}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Level {lvl}</span>
                             {isCompleted && <CheckCircle2 size={16} className="text-teal-500" />}
                          </div>
                          <h3 className="text-2xl font-display font-bold text-secondary tracking-tight">
                             {isCompleted ? 'Level Completed' : isCurrent ? 'Active Goal' : 'Locked Level'}
                          </h3>
                          <p className="text-sm text-neutral-400 font-light max-w-xs leading-relaxed italic">
                             {isCompleted ? 'You have successfully mastered the wisdom of this level.' : isCurrent ? 'This is where your journey continues today.' : 'Complete previous levels to unlock this wisdom.'}
                          </p>
                       </div>

                       <div className="flex flex-col items-center gap-4">
                          {isUnlocked ? (
                             <button 
                               onClick={() => navigate(`/quest/play/${lvl}`)}
                               className={`px-10 py-4 rounded-2xl font-bold text-sm tracking-widest transition-all active:scale-95 ${isCurrent ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white border border-neutral-100 text-primary hover:bg-neutral-50'}`}
                             >
                                {isCurrent ? 'RESUME JOURNEY' : 'REVISIT LEVEL'}
                             </button>
                          ) : (
                             <div className="px-10 py-4 rounded-2xl bg-neutral-50 text-neutral-300 font-bold text-sm flex items-center gap-3 cursor-not-allowed">
                                <Lock size={16} /> LOCKED
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Completion Bar (only for unlocked levels) */}
                    {isUnlocked && (
                       <div className="mt-8 pt-8 border-t border-neutral-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(s => <div key={s} className={`w-8 h-8 rounded-full border-2 border-white ${isCompleted ? 'bg-amber-400' : 'bg-neutral-100'}`} />)}
                             </div>
                             <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{isCompleted ? '3 / 3 Stars' : 'Ready to start'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Sparkles size={14} className="text-primary/40" />
                             <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Mastery Level</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            );
          })}
        </div>

        {/* --- FINAL ACTION CARD --- */}
        <section className="mt-40 bg-secondary rounded-[40px] p-16 text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity" />
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           
           <div className="relative z-10 max-w-xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mx-auto transition-transform duration-700 group-hover:scale-110">
                 <Zap size={40} className="text-amber-400 fill-amber-400" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-display font-bold tracking-tight">Your Journey is Calling</h2>
                 <p className="text-lg text-white/60 font-light leading-relaxed">
                    Every level you complete brings you closer to deep understanding. Keep going at <span className="text-white font-bold italic">Level {currentLvl}</span>.
                 </p>
              </div>
              <button 
                onClick={() => navigate(`/quest/play/${currentLvl}`)}
                className="bg-white text-secondary px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Go to Active Level
              </button>
           </div>
        </section>
      </main>
    </div>
  );
};

export default Quest;