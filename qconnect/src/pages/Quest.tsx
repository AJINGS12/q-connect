import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Lock, Star, Heart, 
  Zap, Trophy, BookOpen, User, Shield
} from 'lucide-react';

const Quest: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  // Helper to create the S-curve offset
  const getOffset = (index: number) => {
    const offsets = [0, 50, 20, -30, -60, 0, 60, 30, -20, 0];
    return offsets[index % offsets.length];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]"><div className="w-8 h-8 border-4 border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" /></div>;

  const currentLvl = profile?.current_quest_level || 1;

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-32">
      {/* --- PREMIUM TOP BAR --- */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#00695C] flex items-center justify-center text-white font-bold text-xs shadow-lg">LV.{currentLvl}</div>
             <h1 className="font-display font-bold text-secondary">Knowledge Quest</h1>
          </div>
          <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold">12 ⚡</span>
            <span className="text-xs font-bold text-amber-500">5 💡</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pt-10">
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Mission</span>
          <h2 className="text-4xl font-display font-bold text-[#00695C] mt-1">The Luminary Archive</h2>
          <div className="mt-4 flex items-center gap-4">
             <div className="flex-grow h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: '60%' }} />
             </div>
             <span className="text-xs font-bold text-neutral-400">60%</span>
          </div>
        </div>

        {/* --- THE VERTICAL PATH --- */}
        <div className="relative flex flex-col items-center gap-12 py-10">
          {/* Background Dotted Line */}
          <div className="absolute top-0 bottom-0 w-1 border-l-4 border-dotted border-neutral-100 left-1/2 -translate-x-1/2" />

          {levels.map((lvl, index) => {
            const isUnlocked = lvl <= currentLvl;
            const isCurrent = lvl === currentLvl;
            const isMastered = lvl < currentLvl;

            return (
              <div 
                key={lvl} 
                style={{ transform: `translateX(${getOffset(index)}px)` }}
                className="relative z-10"
              >
                <button
                  onClick={() => navigate(`/quest/play/${lvl}`)}
                  disabled={!isUnlocked}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
                    isCurrent 
                    ? 'bg-[#00695C] ring-8 ring-teal-100 scale-110' 
                    : isMastered 
                    ? 'bg-[#00695C]' 
                    : 'bg-neutral-200 shadow-none'
                  }`}
                >
                  {isMastered ? (
                    <span className="text-white font-bold text-xl">{lvl}</span>
                  ) : isCurrent ? (
                    <div className="text-center">
                       <span className="text-white font-bold text-2xl">{lvl}</span>
                       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-md border border-neutral-100 px-3 py-1 rounded-lg">
                          <span className="text-[8px] font-black text-[#00695C] uppercase whitespace-nowrap">Current</span>
                       </div>
                    </div>
                  ) : (
                    <Lock size={20} className="text-neutral-400" />
                  )}
                </button>
                {isMastered && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border border-neutral-100 px-2 py-0.5 rounded shadow-sm">
                    <span className="text-[7px] font-bold text-neutral-400 uppercase">Mastered</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- BOTTOM ACTION CARD --- */}
        <div className="mt-20 bg-white border border-neutral-100 rounded-[32px] p-8 shadow-xl text-center">
           <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00695C]">
                 <BookOpen size={32} />
              </div>
           </div>
           <h3 className="text-xl font-bold text-secondary mb-2">Mastery Unlocked</h3>
           <p className="text-sm text-neutral-400 mb-8">Complete Level {currentLvl} to access the Ancient Manuscripts vault.</p>
           <button 
             onClick={() => navigate(`/quest/play/${currentLvl}`)}
             className="w-full bg-[#00695C] text-white py-5 rounded-2xl font-bold shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
           >
             Start Level {currentLvl} Quest
           </button>
        </div>
      </div>

      {/* --- FOOTER NAV --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-8 py-4 flex justify-between items-center z-50">
         <div className="flex flex-col items-center gap-1 text-[#00695C]">
            <div className="p-2 bg-teal-50 rounded-xl"><Shield size={20} /></div>
            <span className="text-[10px] font-bold">Map</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-neutral-300" onClick={() => navigate('/quran')}>
            <BookOpen size={20} />
            <span className="text-[10px] font-bold">Archive</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-neutral-300" onClick={() => navigate('/badges')}>
            <Trophy size={20} />
            <span className="text-[10px] font-bold">Mastery</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-neutral-300">
            <User size={20} />
            <span className="text-[10px] font-bold">Profile</span>
         </div>
      </div>
    </div>
  );
};

export default Quest;