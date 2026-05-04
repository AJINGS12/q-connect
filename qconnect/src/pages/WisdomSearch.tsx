import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Loader2, Sparkles, BookOpen } from 'lucide-react';

interface QuranWord {
  char_type: string;
  text: string;
}

interface Translation {
  text: string;
  name: string;
}

interface SearchResult {
  verse_key: string;
  words: QuranWord[];
  translations: Translation[];
}

const WisdomSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);

    try {
      // Using language=en explicitly searches English translations
      const res = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=20&page=1&language=en`);

      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await res.json();
      setResults(data.search?.results || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const reconstructArabic = (words: QuranWord[]) => {
    return words
      .filter(w => w.char_type !== 'end') // exclude the verse number bubble
      .map(w => w.text)
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-bg-soft font-body text-secondary pb-32">
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-primary/30 text-primary shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Discover</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Wisdom Search</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6 space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* EXPLANATORY HEADER & SEARCH BAR */}
        <section className="premium-card p-6 md:p-14 relative overflow-hidden text-center z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -z-10" />

          <div className="mb-6 md:mb-10 space-y-3">
            <h2 className="text-2xl md:text-5xl font-display font-bold text-secondary italic">Seek the Divine Truth</h2>
            <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-lg font-light leading-relaxed">
              Search the Quran by topics, concepts, or exact words. Discover verses about <span className="text-primary font-bold italic">Fasting, Prophet Yusuf, Marriage, Riba</span> or anything you seek.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto flex items-center shadow-2xl rounded-2xl md:rounded-[32px] bg-white group border border-neutral-100/50 focus-within:border-primary/30 transition-all">
            <div className="absolute left-4 md:left-6 text-neutral-300 group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Patience, Prayer, Fasting..."
              className="w-full bg-transparent py-4 md:py-6 pl-12 md:pl-16 pr-24 md:pr-32 text-base md:text-xl outline-none placeholder:text-neutral-300 text-secondary"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 md:right-3 bg-primary text-white px-6 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-[24px] font-bold text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>
        </section>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Unveiling Wisdom...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-8 rounded-premium-card text-center border border-red-100">
            <p className="font-bold">Error retrieving verses</p>
            <p className="text-sm opacity-80 mt-1">{error}</p>
          </div>
        )}

        {/* RESULTS GRID */}
        {!loading && !error && hasSearched && (
          <section className="space-y-8 pb-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">
                {results.length} Verses Found
              </span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-premium-card border border-neutral-100">
                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-200 mx-auto mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-secondary">No exact matches found</h3>
                <p className="text-neutral-400 mt-2">Try searching using different keywords or broader concepts.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {results.map((item, idx) => {
                  const arabicContext = reconstructArabic(item.words);
                  const translationText = item.translations?.[0]?.text || 'Translation unavailable';

                  return (
                    <div
                      key={`${item.verse_key}-${idx}`}
                      className="bg-white rounded-premium-card p-6 md:p-12 shadow-sm border border-neutral-100/50 hover:border-primary/20 hover:shadow-xl transition-all relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 opacity-[0.02] text-primary group-hover:scale-110 transition-transform -translate-y-4 translate-x-4">
                        <BookOpen className="w-32 h-32 md:w-40 md:h-40" />
                      </div>

                      <div className="relative z-10 space-y-6 md:space-y-10">
                        {/* Status Header */}
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shrink-0">
                            Surah {item.verse_key.split(':')[0]} : Ayah {item.verse_key.split(':')[1]}
                          </div>
                        </div>

                        {/* Arabic */}
                        <div className="text-right">
                          <p className="font-arabic text-3xl md:text-5xl leading-[1.8] text-neutral-800 dir-rtl">
                            {arabicContext}
                          </p>
                        </div>

                        {/* English Translation */}
                        <div className="border-l-4 border-primary/20 pl-4 md:pl-6 rounded-l-md bg-gradient-to-r from-primary/5 to-transparent p-4 md:p-6">
                          <p
                            className="text-base md:text-xl text-neutral-600 font-light leading-relaxed italic [&>em]:not-italic [&>em]:font-bold [&>em]:text-primary [&>em]:bg-primary/10 [&>em]:px-1 [&>em]:rounded"
                            // Dangerously set because the API returns <em>ramadan</em> to highlight keywords
                            dangerouslySetInnerHTML={{ __html: `"${translationText}"` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default WisdomSearch;
