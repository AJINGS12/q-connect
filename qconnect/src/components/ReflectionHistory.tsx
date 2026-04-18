import React, { useState, useEffect } from 'react';
import { getUserReflections } from '../services/nudgeService';
import type { Reflection } from '../services/nudgeService';
import { Calendar, Quote, ChevronRight, History, Edit3, Loader2 } from 'lucide-react';

interface ReflectionHistoryProps {
  onEdit?: (reflection: any) => void;
  refreshTrigger?: number; // Add this prop to trigger refreshes
}

const ReflectionHistory: React.FC<ReflectionHistoryProps> = ({ onEdit, refreshTrigger }) => {
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReflections = async () => {
    console.log('ReflectionHistory: Loading reflections...');
    setLoading(true);
    try {
      const data = await getUserReflections();
      console.log('ReflectionHistory: Fetched reflections:', data);
      
      const enrichedData = await Promise.all((data || []).map(async (ref) => {
        try {
          // 1. Clean the verse key (handle ranges like '94:5-6')
          const cleanKey = ref.verse_key.split('-')[0];
          
          // 2. Fetch Arabic Text
          const arabicUrl = `https://api.quran.com/api/v4/verses/by_key/${cleanKey}?fields=text_uthmani`;
          const vRes = await fetch(arabicUrl).then(r => r.json());
          const arabicText = vRes.verse?.text_uthmani || "Arabic text unavailable";
          
          // 3. Fetch Translation (ID 85 is reliable)
          const tUrl = `https://api.quran.com/api/v4/quran/translations/85?verse_key=${cleanKey}`;
          const tResult = await fetch(tUrl).then(r => r.json());
          const tText = tResult.translations?.[0]?.text || "Translation unavailable";

          // 4. Clean translation of HTML tags
          const translationText = tText.replace(/<[^>]*>?/gm, '').trim();

          return {
            ...ref,
            arabic: arabicText,
            translation: translationText
          };
        } catch (e) {
          console.error(`Error enriching verse ${ref.verse_key}:`, e);
          return { ...ref, arabic: "Error", translation: "Check connection" };
        }
      }));

      setReflections(enrichedData);
    } catch (err) {
      console.error("Error loading journal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('ReflectionHistory: refreshTrigger changed to', refreshTrigger, 'reloading reflections...');
    loadReflections();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#00695C]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Syncing with Cloud...</p>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-neutral-100 px-10">
        <History className="mx-auto mb-4 text-neutral-200" size={48} />
        <p className="text-secondary font-display text-xl font-bold">No Reflections Yet</p>
        <p className="text-neutral-400 text-sm mt-2 max-w-xs mx-auto">Your spiritual journey starts here. Reflect on a verse to begin your journal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {reflections.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onEdit?.(item)}
          className="group bg-white rounded-[40px] border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-700 cursor-pointer active:scale-[0.99]"
        >
          {/* HEADER & SOURCE WISDOM */}
          <div className="bg-[#00695C]/5 p-8 md:p-10 border-b border-neutral-50">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[#00695C] text-white flex items-center justify-center shadow-lg shadow-teal-900/20">
                   <span className="text-xs font-bold">{item.verse_key.split(':')[0]}</span>
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-[#00695C] uppercase tracking-widest block">Surah {item.verse_key}</span>
                   <span className="text-[10px] font-bold text-neutral-300 uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
            </div>
            
            {/* Arabic */}
            <p dir="rtl" className="font-arabic text-4xl text-right text-[#00695C] leading-[2] mb-8 drop-shadow-sm">
              {item.arabic}
            </p>
            
            {/* Translation (Cleaned of HTML) */}
            <div className="border-l-4 border-[#00695C]/10 pl-6 py-1">
              <p className="text-md text-neutral-500 font-light leading-relaxed italic">
                {item.translation.replace(/<[^>]*>?/gm, '')}
              </p>
            </div>
          </div>

          {/* USER CONTENT */}
          <div className="p-8 md:p-10 bg-white relative overflow-hidden">
            <Quote className="absolute -top-4 -right-4 text-neutral-50/50" size={120} />
            
            <div className="flex items-center gap-2 mb-6 text-[#00695C]">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00695C]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Reflection</span>
            </div>

            <p className="text-secondary text-xl leading-relaxed font-medium italic relative z-10">
              "{item.reflection_text}"
            </p>
            
            <div className="mt-10 pt-8 border-t border-neutral-50 flex justify-between items-center">
               <div className="flex items-center gap-3 text-neutral-300 group-hover:text-[#00695C] transition-all duration-300">
                 <div className="w-8 h-8 rounded-lg bg-neutral-50 group-hover:bg-[#00695C]/10 flex items-center justify-center transition-colors">
                    <Edit3 size={14} />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Update your thoughts</span>
               </div>
               <div className="flex items-center gap-2 text-neutral-200 group-hover:text-[#00695C] group-hover:translate-x-1 transition-all">
                  <span className="text-[10px] font-black uppercase">Review</span>
                  <ChevronRight size={18} />
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReflectionHistory;