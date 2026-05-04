import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Lock, Zap, Info, CheckCircle2, Star, Sparkles
} from 'lucide-react';
import QuestOnboarding from '../components/QuestOnboarding';

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

  const paths = [
    {
      id: 1,
      title: 'Foundations',
      description: 'The core beliefs and practices.',
      icon: '🌱',
      levels: Array.from({ length: 10 }, (_, i) => i + 1)
    },
    {
      id: 2,
      title: 'Character Building',
      description: 'Developing moral virtues and good manners.',
      icon: '🛠️',
      levels: Array.from({ length: 10 }, (_, i) => i + 11)
    },
    {
      id: 3,
      title: 'Wisdom for Life',
      description: 'Applying Quranic wisdom to daily life situations.',
      icon: '🧠',
      levels: Array.from({ length: 10 }, (_, i) => i + 21)
    }
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center manuscript-canvas">
      <div className="w-8 h-8 border-4 border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
    </div>
  );

  const currentLvl = profile?.current_quest_level || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] pb-32 font-body transition-all duration-700">
      {showInfo && <QuestOnboarding onClose={() => setShowInfo(false)} />}

      {/* --- TOP BAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-primary/30 text-primary shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Learning Path</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Knowledge Quest</h1>
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

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-16 w-full">
        <div className="mb-8 md:mb-16 space-y-3 text-center">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
            Personal Growth
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-secondary tracking-tight">
            Knowledge <span className="text-primary">Journey</span>
          </h2>
          <p className="text-neutral-500 font-light leading-relaxed max-w-xl mx-auto">
            Progress through paths of wisdom. Each challenge will test your understanding and help you apply the Quran to your daily life.
          </p>
        </div>

        <div className="space-y-8 md:space-y-12 relative">
          {paths.map((path, pathIndex) => {
            const isPathUnlocked = currentLvl >= path.levels[0] || (pathIndex === 0);
            const isPathCompleted = currentLvl > path.levels[path.levels.length - 1];
            
            return (
              <div 
                key={path.id} 
                className={`transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${isPathUnlocked ? 'opacity-100' : 'opacity-60 grayscale'}`}
                style={{ transitionDelay: `${pathIndex * 150}ms` }}
              >
                {/* Path Header */}
                <div className={`rounded-3xl p-8 mb-6 ${isPathUnlocked ? 'bg-white shadow-xl shadow-neutral-200/40 border border-primary/10' : 'bg-neutral-100 border border-neutral-200'}`}>
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isPathUnlocked ? 'bg-primary/5' : 'bg-neutral-200/50'}`}>
                            {isPathUnlocked ? path.icon : <Lock className="text-neutral-400 w-8 h-8" />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Path {path.id}</span>
                               {isPathCompleted && <span className="bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Completed</span>}
                            </div>
                            <h3 className="text-2xl font-display font-bold text-secondary tracking-tight">{path.title}</h3>
                            <p className="text-sm text-neutral-500 font-light mt-1">{path.description}</p>
                         </div>
                      </div>
                      
                      <div className="text-right">
                         <div className="text-sm font-bold text-neutral-400">Progress</div>
                         <div className="text-2xl font-display font-black text-secondary">
                            {isPathUnlocked 
                              ? Math.min(Math.max(currentLvl - path.levels[0] + (isPathCompleted ? 1 : 0), 0), 10) 
                              : 0} <span className="text-neutral-300">/ 10</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Path Levels Grid */}
                {isPathUnlocked && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {path.levels.map((lvl) => {
                      const isUnlocked = lvl <= currentLvl;
                      const isCurrent = lvl === currentLvl;
                      const isCompleted = lvl < currentLvl;

                      return (
                        <button
                          key={lvl}
                          onClick={() => isUnlocked && navigate(`/quest/play/${lvl}`)}
                          className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-2 md:gap-3 transition-all duration-300 ${
                            isCurrent 
                              ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105 z-10 ring-4 ring-primary/20' 
                              : isCompleted 
                                ? 'bg-white border-2 border-teal-50 hover:border-teal-100 hover:scale-105 hover:shadow-lg' 
                                : 'bg-neutral-50 border-2 border-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                        >
                           {isCompleted && (
                             <div className="absolute top-3 right-3 text-teal-500">
                               <CheckCircle2 size={16} className="fill-teal-50" />
                             </div>
                           )}
                           
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-display ${
                             isCurrent 
                               ? 'bg-white/20 text-white' 
                               : isCompleted 
                                 ? 'bg-teal-50 text-teal-700' 
                                 : 'bg-neutral-100 text-neutral-300'
                           }`}>
                              {isUnlocked ? lvl : <Lock size={16} />}
                           </div>
                           
                           <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-white/90' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
                             {isCurrent ? 'Play Now' : isCompleted ? 'Replay' : 'Locked'}
                           </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- FINAL ACTION CARD --- */}
        <section className="mt-12 md:mt-24 bg-secondary rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity" />
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           
           <div className="relative z-10 max-w-xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mx-auto transition-transform duration-700 group-hover:scale-110">
                 <Sparkles size={40} className="text-amber-400" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-display font-bold tracking-tight">Continue Your Journey</h2>
                 <p className="text-lg text-white/60 font-light leading-relaxed">
                    Gain wisdom one challenge at a time. Ready for <span className="text-white font-bold">Challenge {currentLvl}</span>?
                 </p>
              </div>
              <button 
                onClick={() => navigate(`/quest/play/${currentLvl}`)}
                className="bg-white text-secondary px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Go to Active Challenge
              </button>
           </div>
        </section>
      </main>
    </div>
  );
};

export default Quest;