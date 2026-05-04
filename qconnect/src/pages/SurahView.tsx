import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Volume2, ChevronLeft, 
  Minus, Plus, Award, Globe, Sparkles, BookmarkPlus, Save
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { addQuranUserBookmark } from '../services/quranUserApi';
import { useVerseEngagement } from '../hooks/useVerseEngagement';
import { activityTrackerEngine } from '../services/activityService';

interface SurahViewProps {
  chapterId: number;
}

const toArabicNumber = (num: number) => {
  return num.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
};

const VerseItem = ({ 
  v, 
  i, 
  chapterId, 
  isDone, 
  isReciting, 
  fontSize, 
  toggleVerse, 
  getFullTransliteration, 
  externalRef 
}: any) => {
  useVerseEngagement({
    surahNumber: chapterId,
    ayahNumber: i + 1,
    externalRef: externalRef
  });

  const finalTranslation = v.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, '') || "Translation not found";

  return (
    <div ref={externalRef} className={`flex flex-col w-full border-b border-neutral-100 pb-8 md:pb-12 transition-all duration-700 ${isReciting ? 'scale-[1.02] opacity-100' : ''}`}>
      <div className="flex flex-row-reverse items-start gap-8 mb-8">
        <p dir="rtl" className={`text-right font-arabic leading-[2.5] flex-grow transition-colors duration-500 ${isReciting ? 'text-[#00695C]' : 'text-secondary'}`} style={{ fontSize: `${fontSize}px` }}>
          {v.text_uthmani}
          <button onClick={() => toggleVerse(v.id)} className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 font-arabic text-xl mx-4 transition-all ${isDone || isReciting ? 'bg-[#00695C] border-[#00695C] text-white shadow-lg' : 'border-neutral-100 text-neutral-300'}`}>
            {toArabicNumber(i + 1)}
          </button>
        </p>
      </div>
      <div className={`w-full text-left pt-6 border-t border-neutral-50 space-y-4 ${isReciting ? 'border-[#00695C]/20' : ''}`}>
        <p className={`text-sm italic font-medium ${isReciting ? 'text-[#00695C]' : 'text-[#00695C]/70'}`}>{getFullTransliteration(v.words)}</p>
        <p className="text-base md:text-xl text-neutral-500 font-light leading-relaxed">{finalTranslation}</p>
      </div>
    </div>
  );
};


const SurahView: React.FC<SurahViewProps> = ({ chapterId }) => {
  const navigate = useNavigate();
  const [verses, setVerses] = useState<any[]>([]);
  const [surahInfo, setSurahInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 28 : 38);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  
  const [hasCompletedSurah, setHasCompletedSurah] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setHasCompletedSurah(false);
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const infoRes = await fetch(`https://api.quran.com/api/v4/chapters/${chapterId}`);
        const infoData = await infoRes.json();
        setSurahInfo(infoData.chapter);

        // Initial save on load
        if (user) {
          await supabase
            .from('user_profiles')
            .update({ 
              last_surah_num: chapterId, 
              last_surah_name: infoData.chapter.name_simple 
            })
            .eq('id', user.id);
        }

        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=en&translations=131,22&fields=text_uthmani&words=true&audio=7&per_page=300`
        );
        const data = await res.json();
        const versesData = data.verses || [];
        setVerses(versesData);
        
        verseRefs.current = versesData.map(() => React.createRef<HTMLDivElement>());
      } catch (err) { 
        console.error("Quran API Fetch Error:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId]);

  useEffect(() => {
    if (!verses.length || hasCompletedSurah) return;
    if (completedVerses.length >= verses.length) {
      handleSurahCompletion();
    }
  }, [completedVerses, verses.length, hasCompletedSurah]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getAudioUrls = (verseKey: string) => {
    const [sId, vId] = verseKey.split(':');
    const paddedSurah = sId.padStart(3, '0');
    const paddedVerse = vId.padStart(3, '0');
    
    return [
      `https://verses.quran.com/Alafasy/mp3/${verseKey}.mp3`,
      `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedVerse}.mp3`,
      `https://www.everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/${paddedSurah}${paddedVerse}.mp3`,
      verses[parseInt(vId) - 1]?.audio?.url
    ].filter(Boolean);
  };

  const tryPlayAudio = async (urls: string[], index: number): Promise<boolean> => {
    if (!audioRef.current) return false;
    for (const url of urls) {
      try {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.load();
        
        await new Promise((resolve, reject) => {
          const audio = audioRef.current!;
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(true);
          };
          const onError = (e: Event) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(e);
          };
          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        await audioRef.current.play();
        setAudioError(null);
        return true;
      } catch (err) {
        continue;
      }
    }
    return false;
  };

  const playVerseAudio = async (index: number) => {
    if (index >= verses.length) {
      setIsPlaying(false);
      setCurrentAudioIndex(null);
      handleSurahCompletion();
      return;
    }

    const verse = verses[index];

    // --- GRANULAR SAVE: Update current ayah progress as it plays ---
    const { data: { user } } = await supabase.auth.getUser();
    if (user && surahInfo) {
      await supabase
        .from('user_profiles')
        .update({ 
          last_surah_num: chapterId, 
          last_surah_name: surahInfo.name_simple,
          last_ayah_num: index + 1 
        })
        .eq('id', user.id);
    }

    if (!completedVerses.includes(verse.id)) {
      setCompletedVerses(prev => [...prev, verse.id]);
    }

    setCurrentAudioIndex(index);
    // Track Recite event
    activityTrackerEngine.logEvent({
       user_id: '',
       surah_number: chapterId,
       ayah_number: index + 1,
       interaction_type: 'listen',
       timestamp_start: new Date().toISOString(),
       timestamp_end: new Date(Date.now() + 5000).toISOString(),
       duration_seconds: 5,
       visibility_ratio: 1.0,
       scroll_velocity: 0
    });
    const audioUrls = getAudioUrls(verse.verse_key);
    const success = await tryPlayAudio(audioUrls, index);
    
    if (success) {
      setIsPlaying(true);
      verseRefs.current[index]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      if (audioRef.current) {
        audioRef.current.onended = () => {
          if (index + 1 < verses.length) {
            playVerseAudio(index + 1);
          } else {
            setIsPlaying(false);
            setCurrentAudioIndex(null);
            handleSurahCompletion();
          }
        };
      }
    } else {
      setAudioError(`Could not load audio for verse ${index + 1}`);
      setTimeout(() => {
        if (index + 1 < verses.length) playVerseAudio(index + 1);
        else handleSurahCompletion();
      }, 500);
    }
  };

  const handleSurahCompletion = async () => {
    if (hasCompletedSurah || !surahInfo) return;
    setHasCompletedSurah(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('user_profiles')
        .update({ last_ayah_num: surahInfo.verses_count })
        .eq('id', user.id);
    }
  };

  const handlePlayPause = () => {
    if (!verses.length) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const index = currentAudioIndex === null ? 0 : currentAudioIndex;
      playVerseAudio(index);
    }
  };

  const handleRestart = () => {
    setCurrentAudioIndex(null);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    playVerseAudio(0);
  };

  const handleSaveBookmark = async () => {
    const verseNumber = currentAudioIndex !== null ? currentAudioIndex + 1 : Math.max(1, completedVerses.length || 1);

    // Track Bookmark event
    activityTrackerEngine.logEvent({
       user_id: '',
       surah_number: chapterId,
       ayah_number: verseNumber,
       interaction_type: 'bookmark',
       timestamp_start: new Date().toISOString(),
       timestamp_end: new Date().toISOString(),
       duration_seconds: 1,
       visibility_ratio: 1.0,
       scroll_velocity: 0
    });

    setBookmarkSaving(true);
    setBookmarkStatus(null);
    const result = await addQuranUserBookmark({
      key: chapterId,
      verseNumber,
      mushaf: 1,
      isReading: true,
    });
    setBookmarkSaving(false);
    setBookmarkStatus(result.success ? `Saved bookmark at Ayah ${verseNumber}` : (result.message || 'Failed to save bookmark.'));
  };

  const getFullTransliteration = (words: any[]) => {
    if (!words) return "Transliteration not found";
    return words.map(word => word.transliteration?.text).filter(Boolean).join(' ');
  };

  const toggleVerse = (id: number) => {
    setCompletedVerses(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  if (loading || !surahInfo) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-44">
      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm mb-6">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/quran')} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-sm text-[#00695C] hover:border-[#00695C]/30 transition-all active:scale-95 shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">The Holy Quran</p>
            <h1 className="text-base md:text-lg font-display text-[#00695C] tracking-tight font-bold leading-tight">{surahInfo.name_simple}</h1>
          </div>
        </div>
      </nav>

      <div className="px-4 md:px-6 max-w-4xl mx-auto">

        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00695C] transition-all duration-700" style={{ width: `${(completedVerses.length / surahInfo.verses_count) * 100}%` }} />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em]">{completedVerses.length} / {surahInfo.verses_count} verses</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-[#F1F3F5] rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border border-neutral-100 mt-4 md:mt-0">
          <div className="flex items-center gap-4 px-4 w-full md:w-auto md:border-r border-neutral-200 justify-center md:justify-start">
            <Globe size={18} className="text-neutral-500" />
            <span className="text-xs font-medium text-neutral-600">Sahih International</span>
          </div>
          <div className="flex items-center gap-6 px-4">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Font Size</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setFontSize(s => s - 2)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><Minus size={14}/></button>
              <span className="text-sm font-bold">{fontSize}</span>
              <button onClick={() => setFontSize(s => s + 2)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><Plus size={14}/></button>
            </div>
          </div>
          <button
            onClick={handleSaveBookmark}
            disabled={bookmarkSaving}
            className="ml-3 inline-flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm text-[#00695C] text-xs font-bold disabled:opacity-60 hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-100"
          >
            <Save size={14} />
            {bookmarkSaving ? 'Saving...' : 'Bookmark'}
          </button>
        </div>
        {bookmarkStatus && (
          <p className="text-xs text-[#00695C] mt-3 px-2">{bookmarkStatus}</p>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 space-y-10 md:space-y-16">
        {verses.map((v, i) => {
          const isDone = completedVerses.includes(v.id);
          const isReciting = currentAudioIndex === i;
          return (
            <VerseItem
              key={v.id}
              v={v}
              i={i}
              chapterId={chapterId}
              isDone={isDone}
              isReciting={isReciting}
              fontSize={fontSize}
              toggleVerse={toggleVerse}
              getFullTransliteration={getFullTransliteration}
              externalRef={verseRefs.current[i]}
            />
          );
        })}
      </main>

      {/* --- AUDIO PLAYER --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
        <div className="bg-[#004D40] text-white p-3.5 rounded-[24px] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <button onClick={handlePlayPause} className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-[#004D40] active:scale-95 transition-all">
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
            </button>
            <div>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{isPlaying ? `Verse ${(currentAudioIndex ?? 0) + 1}` : 'Reciting'}</p>
              <p className="text-sm font-medium">Mishary Rashid Alafasy</p>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-4 opacity-50">
            <RotateCcw size={22} className="cursor-pointer hover:opacity-100 transition-opacity" onClick={handleRestart} />
            <Volume2 size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurahView;