import React, { useState, useEffect } from 'react';
import { getDailyNudge, getTimeOfDay } from '../services/nudgeService';
import type { ThemeVerse } from '../services/nudgeService';
import ReflectionModal from './ReflectionModal'; 
import { Sun, Sunset, Moon, PenLine, BookOpen, Loader2 } from 'lucide-react';

interface VerseData {
  verse_key: string;
  text_uthmani: string;
  translations: Array<{ 
    id: number;
    resource_id: number;
    text: string;
  }>;
}

const DailyNudge: React.FC = () => {
  const [nudge, setNudge] = useState<ThemeVerse | null>(null);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeOfDay] = useState(getTimeOfDay());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { 
    loadDailyNudge(); 
  }, []);

  const loadDailyNudge = async () => {
    setLoading(true);
    try {
      const nudgeData = await getDailyNudge();
      
      if (nudgeData) {
        setNudge(nudgeData);
        
        // Clean the verse key (handle ranges like '94:5-6')
        const cleanKey = nudgeData.verse_key.split('-')[0];
        
        console.log('Fetching verse:', cleanKey);
        
        // Fetch Arabic text
        const arabicRes = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${cleanKey}?fields=text_uthmani`
        );

        // Fetch translation (85 = M.A.S. Abdel Haleem)
        const translationRes = await fetch(
          `https://api.quran.com/api/v4/quran/translations/85?verse_key=${cleanKey}`
        );

        if (!arabicRes.ok || !translationRes.ok) {
          throw new Error('API call failed');
        }

        const arabicData = await arabicRes.json();
        const translationData = await translationRes.json();

        console.log('Arabic Data:', arabicData);
        console.log('Translation Data:', translationData);

        // Combine both responses into the expected format
        const combinedVerse: VerseData = {
          verse_key: cleanKey,
          text_uthmani: arabicData.verse.text_uthmani,
          translations: translationData.translations.map((t: any) => ({
            resource_id: t.resource_id,
            text: t.text
          }))
        };
        setVerseData(combinedVerse);
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

  // Extract translation text
  const getTranslation = (): string => {
    if (!verseData.translations || !Array.isArray(verseData.translations)) {
      console.error('No translations array found');
      return 'Translation not available';
    }

    if (verseData.translations.length === 0) {
      console.error('Translations array is empty');
      return 'Translation not available';
    }

    const translationObj = verseData.translations[0];
    if (!translationObj || !translationObj.text) {
      console.error('Translation object is malformed:', translationObj);
      return 'Translation not available';
    }

    // Remove HTML tags and clean up
    return translationObj.text.replace(/<[^>]*>/g, '').trim();
  };

  const translation = getTranslation();

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
                Daily Reflection
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

          {/* Reflect Button */}
          <div className="flex justify-end pt-8 border-t border-neutral-200/30">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-3 bg-[#00695C] hover:bg-[#004D40] text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-900/10 active:scale-95"
            >
              <PenLine size={16} />
              Reflect
            </button>
          </div>
        </div>
      </div>

      {/* Reflection Modal */}
      <ReflectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        verseKey={nudge.verse_key}
        verseText={verseData.text_uthmani}
        translation={translation}
        onSave={() => {
          // Set a flag in localStorage to indicate new reflections were saved
          console.log('Setting reflectionsUpdated flag in localStorage');
          localStorage.setItem('reflectionsUpdated', Date.now().toString());
        }}
      />
    </div>
  );
};

export default DailyNudge;