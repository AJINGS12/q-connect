import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSurahs } from "../api/quran";
import type { Surah } from "../types/types";
import { Search, ChevronLeft, MapPin, List } from "lucide-react";
import logoOfficial from "../assets/logo_official.png";

const Quran: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getSurahs().then((data) => {
      setSurahs(data);
      setLoading(false);
    });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toString() === searchQuery
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
       <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft pb-24 font-body transition-all duration-700">
      {/* --- HEADER --- */}
      <nav className="glass-panel sticky top-0 z-50 py-6 px-8 border-none bg-white/70">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/home")}
              className="w-10 h-10 md:w-12 md:h-12 flex shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white border border-neutral-100 hover:border-primary/30 text-primary shadow-sm transition-all active:scale-95 group"
              aria-label="Back to Overview"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1" />
            </button>
            <div className="flex items-center gap-3 md:gap-4 border-l border-neutral-100 pl-4 md:pl-8">
               <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 bg-white border border-neutral-100 rounded-xl items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
                  <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
               </div>
               <div className="space-y-0.5 md:space-y-1">
                  <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.4em]">Divine revelation</span>
                  <h1 className="text-2xl md:text-4xl font-display font-bold text-secondary tracking-tight italic">The Noble Quran</h1>
               </div>
            </div>
          </div>

          {/* Search within Quran */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors w-4 h-4 md:w-5 md:h-5" />
            <input 
              type="text" 
              placeholder="Search by name or number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 border border-neutral-100 py-3 md:py-4 pl-10 md:pl-14 pr-4 md:pr-6 rounded-xl md:rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xs md:text-sm font-light text-secondary shadow-sm"
            />
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto px-6 pt-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSurahs.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => navigate(`/quran/${s.id}`)}
              className="premium-card p-8 flex items-center gap-6 group cursor-pointer active:scale-[0.98] animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ transitionDelay: `${idx * 20}ms` }}
            >
              {/* Surah Number Icon */}
              <div className="w-16 h-16 bg-neutral-50 rounded-[24px] flex items-center justify-center text-neutral-300 font-display text-xl font-bold group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-xl group-hover:shadow-primary/20">
                {s.id}
              </div>

              {/* Surah Details */}
              <div className="flex-grow space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-secondary group-hover:text-primary transition-colors tracking-tight">
                    {s.name_simple}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                      <MapPin size={10} className="text-neutral-300 group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest group-hover:text-primary transition-colors">{s.revelation_place}</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                      <List size={10} className="text-neutral-300 group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest group-hover:text-primary transition-colors">{s.verses_count} Verses</span>
                   </div>
                </div>
              </div>

              {/* Arabic Name Overlay/Right */}
              <div className="text-right">
                 <span className="font-arabic text-3xl text-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all block duration-500">{s.name_arabic}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Quran;