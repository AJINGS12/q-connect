import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookMarked, Wifi, WifiOff } from 'lucide-react';
import logoOfficial from '../assets/logo_official.png';
import { getQuranUserBookmarks } from '../services/quranUserApi';
import type { QuranBookmark } from '../services/quranUserApi';
import { getQfAccessToken, startQfLogin } from '../services/qfOAuth';

// Surah name lookup (using quran.com API)
const useSurahNames = (keys: number[]) => {
  const [names, setNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!keys.length) return;
    fetch('https://api.quran.com/api/v4/chapters?language=en')
      .then(r => r.json())
      .then(data => {
        const map: Record<number, string> = {};
        (data.chapters || []).forEach((ch: any) => { map[ch.id] = ch.name_simple; });
        setNames(map);
      })
      .catch(() => {});
  }, [keys.join(',')]);

  return names;
};

const MyBookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(!!getQfAccessToken());
  const surahNames = useSurahNames(bookmarks.map(b => b.key));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getQuranUserBookmarks();
      setBookmarks(data);
      setLoading(false);
    };
    if (isConnected) load();
    else setLoading(false);
  }, [isConnected]);

  const handleConnect = () => {
    startQfLogin();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft pb-12 font-body transition-all duration-700">
      {/* Header */}
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
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Library</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">My Bookmarks</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-neutral-50 animate-in slide-in-from-right-4">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Sync</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-neutral-100 px-4 py-2 rounded-2xl opacity-50">
                <WifiOff size={10} className="text-neutral-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Offline</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-3xl mx-auto px-4 md:px-6 pt-6 w-full">
        <header className="mb-8 md:mb-16 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Synced via Quran.com</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-secondary tracking-tight italic">Saved Verses</h2>
          <p className="text-neutral-400 font-light italic leading-relaxed max-w-lg text-sm md:text-lg">
            Your sacred collection, preserved across every device you use.
          </p>
        </header>

        {/* Not connected state */}
        {!isConnected && (
          <div className="premium-card p-8 md:p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-24 h-24 bg-neutral-50 rounded-[32px] flex items-center justify-center mb-8 shadow-inner border border-white">
              <BookMarked size={40} className="text-neutral-200" />
            </div>
            <h2 className="text-3xl font-display font-bold text-secondary mb-4 tracking-tight">Connect Your Account</h2>
            <p className="text-neutral-400 text-md mb-10 max-w-xs leading-relaxed font-light">
              Link your Quran.com account to sync your bookmarks.
            </p>
            <button
              onClick={handleConnect}
              className="bg-primary text-white px-12 py-5 rounded-[22px] font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest"
            >
              Connect Now
            </button>
          </div>
        )}

        {/* Loading */}
        {isConnected && loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em]">Loading Bookmarks...</span>
          </div>
        )}

        {/* Empty state */}
        {isConnected && !loading && bookmarks.length === 0 && (
          <div className="premium-card p-8 md:p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center mb-8 shadow-inner border border-white">
              <BookMarked size={40} className="text-primary/30" />
            </div>
            <h2 className="text-3xl font-display font-bold text-secondary mb-4 tracking-tight">No Bookmarks Found</h2>
            <p className="text-neutral-400 text-md mb-10 max-w-xs leading-relaxed font-light">
              Your bookmarks library is waiting to be filled with your favorite verses.
            </p>
            <button
              onClick={() => navigate('/quran')}
              className="bg-primary text-white px-12 py-5 rounded-[22px] font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest"
            >
              Start Reading
            </button>
          </div>
        )}

        {/* Bookmark list */}
        {isConnected && !loading && bookmarks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 mb-8">
               <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">
                 {bookmarks.length} Saved Verses
               </span>
            </div>

            {bookmarks.map((bm, idx) => (
              <div
                key={bm.id}
                onClick={() => navigate(`/quran/${bm.key}`)}
                className="premium-card p-6 md:p-8 flex items-center gap-4 md:gap-8 group cursor-pointer active:scale-[0.99] animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transitionDelay: `${idx * 30}ms` }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[28px] flex items-center justify-center shrink-0 transition-all duration-700 group-hover:scale-110 ${bm.isReading ? 'bg-primary text-white shadow-xl shadow-primary/30 rotate-3' : 'bg-primary/5 text-primary'}`}>
                  <BookMarked className={`w-6 h-6 md:w-7 md:h-7 ${bm.isReading ? 'animate-pulse' : ''}`} />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    {bm.isReading && (
                      <div className="bg-primary/5 px-2 py-0.5 rounded-lg">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">In Progress</span>
                      </div>
                    )}
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                      Surah {bm.key}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-secondary group-hover:text-primary transition-colors truncate tracking-tight">
                    {surahNames[bm.key] || `Surah ${bm.key}`}
                  </h3>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-bold text-neutral-400">Ayah {bm.verseNumber}</span>
                     <div className="w-1 h-1 rounded-full bg-neutral-200" />
                     <span className="text-xs font-bold text-neutral-400">{formatDate(bm.createdAt)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-200 group-hover:bg-primary group-hover:text-white group-hover:translate-x-3 transition-all shrink-0">
                   <ChevronLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );;
};

export default MyBookmarks;
