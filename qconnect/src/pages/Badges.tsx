import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, Lock, Award, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  target_id?: string;
  badge_name: string;
  badge_icon: string;
  is_unlocked: boolean;
  unlocked_at: string;
  criteria_type: string;
}

const BADGE_LIBRARY: Array<{ id: string; badge_name: string; badge_icon: string; criteria_type: string }> = [
  { id: 'surah_fatihah', badge_name: 'Al-Fatihah - The Opening', badge_icon: '📖', criteria_type: 'surah' },
  { id: 'surah_baqarah', badge_name: 'Al-Baqarah - The Protector', badge_icon: '🛡️', criteria_type: 'surah' },
  { id: 'surah_kahf', badge_name: 'Al-Kahf - The Illuminator', badge_icon: '🕯️', criteria_type: 'surah' },
  { id: 'surah_yasin', badge_name: 'Yasin - The Heart', badge_icon: '❤️', criteria_type: 'surah' },
  { id: 'surah_rahman', badge_name: 'Ar-Rahman - The Gracious', badge_icon: '🌿', criteria_type: 'surah' },
  { id: 'surah_waqiah', badge_name: 'Al-Waqi\'ah - The Abundant', badge_icon: '💎', criteria_type: 'surah' },
  { id: 'surah_mulk', badge_name: 'Al-Mulk - The Guardian', badge_icon: '👑', criteria_type: 'surah' },
  { id: 'surah_ikhlas', badge_name: 'Al-Ikhlas - The Pure', badge_icon: '✨', criteria_type: 'surah' },
  { id: 'surah_falaq', badge_name: 'Al-Falaq - The Daybreak', badge_icon: '🌅', criteria_type: 'surah' },
  { id: 'surah_nas', badge_name: 'An-Nas - The Humanity', badge_icon: '🤲', criteria_type: 'surah' },
  { id: 'quest_level_5', badge_name: 'Level 5', badge_icon: '🧭', criteria_type: 'quest' },
  { id: 'quest_level_6', badge_name: 'Level 6', badge_icon: '🧠', criteria_type: 'quest' },
  { id: 'quest_level_7', badge_name: 'Level 7', badge_icon: '⚔️', criteria_type: 'quest' },
  { id: 'quest_level_8', badge_name: 'Level 8', badge_icon: '🏅', criteria_type: 'quest' },
  { id: 'quest_level_10', badge_name: 'Level 10', badge_icon: '🏆', criteria_type: 'quest' },
];

const Badges: React.FC = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('badge_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('is_unlocked', { ascending: false });

      const progress = data || [];
      const merged = BADGE_LIBRARY.map((base) => {
        const match = progress.find(
          (p: Badge) => p.target_id === base.id || p.badge_name === base.badge_name
        );

        return {
          id: base.id,
          target_id: base.id,
          badge_name: match?.badge_name || base.badge_name,
          badge_icon: match?.badge_icon || base.badge_icon,
          is_unlocked: Boolean(match?.is_unlocked),
          unlocked_at: match?.unlocked_at || '',
          criteria_type: match?.criteria_type || base.criteria_type,
        } as Badge;
      });

      setBadges(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const unlockedCount = badges.filter(b => b.is_unlocked).length;

  return (
    <div className="min-h-screen bg-bg-soft pb-24 font-body transition-all duration-700">
      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 py-6 px-8 border-none bg-white/70">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 md:gap-3 text-neutral-400 hover:text-primary transition-all group shrink-0"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 group-hover:border-primary/30 shadow-sm transition-all">
               <ChevronLeft size={18} className="text-primary" />
            </div>
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Back to Overview</span>
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Award size={16} />
             </div>
             <h1 className="font-display text-sm font-bold text-secondary uppercase tracking-widest">Achievements</h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-neutral-50">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{unlockedCount} / 15</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16">
        <header className="mb-16 space-y-4">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Spiritual Milestones</span>
          <h2 className="text-5xl font-display font-bold text-secondary tracking-tight italic">My Badges</h2>
          <p className="text-neutral-400 font-light italic leading-relaxed max-w-lg text-lg">
            "And for all are degrees according to what they have done." <span className="text-primary font-bold">(46:19)</span>
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-[32px] md:rounded-[40px] animate-pulse border border-neutral-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {badges.map((badge, idx) => (
              <div 
                key={badge.id}
                className={`premium-card relative group p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${
                  badge.is_unlocked 
                    ? 'bg-white border-white scale-100 hover:scale-105 active:scale-95' 
                    : 'bg-neutral-50/50 border-dashed border-neutral-200 opacity-40 grayscale pointer-events-none'
                }`}
                style={{ transitionDelay: `${idx * 20}ms` }}
              >
                {/* Icon Circle */}
                <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[32px] mb-4 md:mb-6 flex items-center justify-center text-4xl md:text-5xl shadow-inner transition-all duration-700 ${
                  badge.is_unlocked ? 'bg-primary/5 text-primary shadow-xl group-hover:scale-110' : 'bg-neutral-100 text-neutral-300'
                }`}>
                  {badge.is_unlocked ? badge.badge_icon : <Lock size={20} className="md:hidden" />}
                  {badge.is_unlocked ? null : <Lock size={28} className="hidden md:block" />}
                </div>

                <h3 className={`text-[10px] font-black uppercase tracking-widest leading-tight ${
                  badge.is_unlocked ? 'text-secondary' : 'text-neutral-400'
                }`}>
                  {badge.badge_name}
                </h3>

                {badge.is_unlocked && (
                   <div className="absolute top-4 right-4 text-amber-400 drop-shadow-lg">
                     <Sparkles size={16} />
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Badges;