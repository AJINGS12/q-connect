import React, { useEffect, useState } from "react";
import { getSurahs } from "../api/quran";
import type { Surah } from "../types/types";
import SurahView from "./SurahView";
import { Search, ChevronLeft, BookOpen, MapPin, List } from "lucide-react";

const Quran: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
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

  // If a Surah is selected, show the Reader
  if (selectedSurahId) {
    return (
      <div className="animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedSurahId(null)}
          className="fixed top-6 left-6 z-[60] p-3 bg-white shadow-lg rounded-2xl text-primary hover:scale-110 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <SurahView chapterId={selectedSurahId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] pb-20">
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display text-primary tracking-tight">The Noble Quran</h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-1">114 Chapters • Divine Revelation</p>
          </div>

          {/* Search within Quran */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border-none py-3 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-light"
            />
          </div>
        </div>
      </header>

      {/* --- SURAH GRID --- */}
      <main className="max-w-6xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurahs.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSurahId(s.id)}
              className="bg-white rounded-[32px] p-6 border border-transparent hover:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group flex items-center gap-5"
            >
              {/* Surah Number Icon */}
              <div className="w-14 h-14 bg-neutral-50 rounded-[20px] flex items-center justify-center text-neutral-300 font-display text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {s.id}
              </div>

              {/* Surah Details */}
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-display text-secondary group-hover:text-primary transition-colors">
                    {s.name_simple}
                  </h2>
                  <span className="font-arabic text-xl text-primary opacity-60">{s.name_arabic}</span>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-neutral-200" /> {s.revelation_place}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <List size={12} className="text-neutral-200" /> {s.verses_count} Verses
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Quran;