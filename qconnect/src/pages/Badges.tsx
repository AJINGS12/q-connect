import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, Lock, Award, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  badge_name: string;
  badge_icon: string;
  is_unlocked: boolean;
  unlocked_at: string;
  criteria_type: string;
}

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
      setBadges(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const unlockedCount = badges.filter(b => b.is_unlocked).length;

  return (
    <div className="min-h-screen bg-[#F3F5F7] pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-neutral-100 py-6 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-neutral-400 hover:text-[#00695C] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <h1 className="font-display text-xl text-primary">Achievements</h1>
          <div className="flex items-center gap-2 bg-teal-50 px-4 py-1.5 rounded-full">
            <Award size={16} className="text-[#00695C]" />
            <span className="text-sm font-bold text-[#00695C]">{unlockedCount}/15</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        <header className="mb-12">
          <h2 className="text-4xl font-display text-secondary mb-3">Trophy Room</h2>
          <p className="text-neutral-500 font-light italic">
            "And for all are degrees [of reward] according to what they have done." (46:19)
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative group p-8 rounded-[40px] flex flex-col items-center justify-center text-center transition-all duration-500 border-2 ${
                  badge.is_unlocked 
                    ? 'bg-white border-white shadow-xl shadow-teal-900/5 hover:scale-105' 
                    : 'bg-neutral-100/50 border-dashed border-neutral-200 opacity-60'
                }`}
              >
                {/* Icon Circle */}
                <div className={`w-20 h-20 rounded-3xl mb-4 flex items-center justify-center text-4xl shadow-inner ${
                  badge.is_unlocked ? 'bg-teal-50' : 'bg-neutral-100 grayscale'
                }`}>
                  {badge.is_unlocked ? badge.badge_icon : <Lock size={24} className="text-neutral-300" />}
                </div>

                <h3 className={`text-xs font-bold uppercase tracking-tighter leading-tight ${
                  badge.is_unlocked ? 'text-neutral-800' : 'text-neutral-400'
                }`}>
                  {badge.badge_name}
                </h3>

                {badge.is_unlocked && (
                   <div className="absolute -top-2 -right-2 bg-teal-500 text-white p-1.5 rounded-full shadow-lg">
                     <Sparkles size={12} />
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