import React, { useState, useEffect } from 'react';
import { getDailyNudge, getTimeOfDay } from '../services/nudgeService';
import type { ThemeVerse } from '../services/nudgeService';
import ReflectionModal from './ReflectionModal'; 
import { Sun, Sunset, Moon, PenLine, BookOpen, Loader2, Heart } from 'lucide-react';
import { toggleFavoriteNudge, checkFavoriteStatus } from '../services/nudgeService';

interface VerseData {
  verse_key: string;
  text_uthmani: string;
  translations: Array<{ 
    id?: number;
    resource_id: number;
    text: string;
  }>;
}

const DailyNudge: React.FC = () => {
  console.log('[DailyNudge] Component Mounting - Version: FAVORITES_READY');
  const [nudge, setNudge] = useState<ThemeVerse | null>(null);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeOfDay] = useState(getTimeOfDay());
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
 
   // Extract translation text safely - AT THE TOP to avoid any Temporal Dead Zone issues
   const translation = (() => {
     try {
       return verseData?.translations?.[0]?.text?.replace(/<[^>]*>/g, '').trim() ?? "";
     } catch (e) {
       return "";
     }
   })();

  useEffect(() => { 
    loadDailyNudge(); 
  }, []);

  const loadDailyNudge = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `daily_nudge_data_${today}`;
      const cachedData = localStorage.getItem(cacheKey);

      let nudgeData;
      let combinedVerse;

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        nudgeData = parsed.nudge;
        combinedVerse = parsed.verse;
        console.log('Using cached daily nudge data');
      } else {
        nudgeData = await getDailyNudge();
        
        if (nudgeData) {
          // Clean the verse key (handle ranges like '94:5-6')
          const cleanKey = nudgeData.verse_key.split('-')[0];
          
          const [arabicRes, translationRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/verses/by_key/${cleanKey}?fields=text_uthmani`),
            fetch(`https://api.quran.com/api/v4/quran/translations/85?verse_key=${cleanKey}`)
          ]);

          if (!arabicRes.ok || !translationRes.ok) {
            throw new Error('API call failed');
          }

          const arabicData = await arabicRes.json();
          const translationData = await translationRes.json();

          combinedVerse = {
            verse_key: cleanKey,
            text_uthmani: arabicData?.verse?.text_uthmani || "",
            translations: (translationData?.translations || []).map((t: any) => ({
              resource_id: t.resource_id,
              text: t.text
            }))
          };

          // Cache for today
          localStorage.setItem(cacheKey, JSON.stringify({ nudge: nudgeData, verse: combinedVerse }));
        }
      }

      if (nudgeData && combinedVerse) {
        setNudge(nudgeData);
        setVerseData(combinedVerse);
        
        // Always check favorite status fresh from DB
        const favorited = await checkFavoriteStatus(nudgeData.verse_key);
        setIsFavorited(favorited);
      }
    } catch (error) { 
      console.error('Scripture Fetch Error:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const theme = (() => {
    switch (timeOfDay) {
      case 'morning': 
        return { 
          icon: <Sun size={18} />, 
          bg: 'bg-amber-50/40', 
          accent: 'text-amber-600', 
          border: 'border-amber-100' 
        };
      case 'afternoon': 
        return { 
          icon: <Sunset size={18} />, 
          bg: 'bg-orange-50/40', 
          accent: 'text-orange-600', 
          border: 'border-orange-100' 
        };
      default: 
        return { 
          icon: <Moon size={18} />, 
          bg: 'bg-indigo-50/30', 
          accent: 'text-indigo-600', 
          border: 'border-indigo-100/50' 
        };
    }
  })();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 h-64 flex items-center justify-center bg-white/50 rounded-[40px] animate-pulse">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    );
  }

  if (!nudge || !verseData) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 h-64 flex items-center justify-center bg-white/50 rounded-[40px]">
        <p className="text-neutral-400">No daily nudge available at the moment</p>
      </div>
    );
  }



  const handleFavorite = async () => {
    if (!nudge || !verseData || isSaving) return;
    setIsSaving(true);
    
    // Optimistic UI update
    setIsFavorited(!isFavorited);
    
    const result = await toggleFavoriteNudge(
      nudge.verse_key,
      verseData.text_uthmani,
      translation
    );
    
    if (result.success) {
      setIsFavorited(result.isFavorited || false);
      // Notify parent to refresh list if needed
      localStorage.setItem('reflectionsUpdated', Date.now().toString());
    } else {
      // Revert on error
      setIsFavorited(!isFavorited);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 mb-10">
      <div className={`relative overflow-hidden rounded-[40px] border ${theme.border} ${theme.bg} backdrop-blur-xl p-8 md:p-12 transition-all duration-700 shadow-sm`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 bg-white rounded-2xl shadow-sm ${theme.accent}`}>
              {theme.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-0.5">
                Daily Contextual Nudge
              </p>
              <h3 className={`text-sm font-bold ${theme.accent} capitalize`}>
                {nudge.theme}
              </h3>
            </div>
          </div>
          <div className="bg-white/60 px-4 py-2 rounded-2xl border border-white/50 flex items-center gap-2">
            <BookOpen size={12} className="text-neutral-400" />
            <span className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
              {nudge.verse_key}
            </span>
          </div>
        </div>

        {/* Scripture Content */}
        <div className="space-y-10">
          {/* Arabic Text */}
          <div className="text-right">
            <p className="font-arabic text-4xl md:text-5xl leading-[1.8] text-neutral-800 dir-rtl drop-shadow-sm">
              {verseData.text_uthmani}
            </p>
          </div>

          {/* Translation */}
          <div className="max-w-3xl border-l-2 border-[#00695C]/20 pl-6">
            <p className="text-xl md:text-2xl text-neutral-600 font-light leading-relaxed italic">
              "{translation}"
            </p>
          </div>

          {/* Context from nudge database */}
          {nudge.context && (
            <div className="bg-white/60 rounded-2xl p-6 border border-white/50">
              <p className="text-sm text-teal-700 font-medium leading-relaxed flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>{nudge.context}</span>
              </p>
            </div>
          )}

          {/* Reflect Button -> changed to Favorite */}
          <div className="flex justify-end pt-8 border-t border-neutral-200/30">
            <button 
              onClick={handleFavorite}
              disabled={isSaving}
              className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                isFavorited 
                  ? 'bg-rose-50 text-rose-500 shadow-rose-100 border border-rose-200' 
                  : 'bg-[#00695C] hover:bg-[#004D40] text-white shadow-teal-900/10'
              }`}
            >
              <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
              {isFavorited ? 'Saved' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyNudge;
