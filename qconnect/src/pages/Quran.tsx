import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSurahs } from "../api/quran";
import type { Surah } from "../types/types";
import { Search, ChevronLeft, Hexagon, Layers } from "lucide-react";
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
       <div className="w-10 h-10 border-[3px] border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-body relative overflow-x-hidden selection:bg-[#00695C]/20 text-neutral-800">
      
      {/* KEYFRAME ANIMATIONS INJECTED */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subtleDrift {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2vh) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes subtleDriftReverse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(2vh) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* --- FLUID AMBIENT BACKGROUND GLOWS (Glassmorphism Base) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
           className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply opacity-[0.15] blur-[100px] md:blur-[140px]"
           style={{ background: 'radial-gradient(circle, #00695C 0%, transparent 70%)', animation: 'subtleDrift 15s ease-in-out infinite' }} 
        />
        <div 
           className="absolute top-[30%] left-[-15%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply opacity-[0.2] blur-[120px] md:blur-[160px]"
           style={{ background: 'radial-gradient(circle, #AEEA00 0%, transparent 70%)', animation: 'subtleDriftReverse 18s ease-in-out infinite' }} 
        />
        <div 
           className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[40vw] rounded-full mix-blend-multiply opacity-[0.1] blur-[150px]"
           style={{ background: 'radial-gradient(circle, #004D40 0%, transparent 60%)', animation: 'subtleDrift 20s ease-in-out infinite' }} 
        />
        {/* Crisp grid overlay to add texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00695C 1px, transparent 1px), linear-gradient(90deg, #00695C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 w-full sticky top-0 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-[#00695C]/30 text-[#00695C] shadow-sm transition-all active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-grow relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-100 py-2.5 pl-9 pr-4 rounded-xl focus:bg-white focus:border-[#00695C]/30 focus:outline-none text-sm font-medium text-neutral-800 placeholder:text-neutral-300 transition-all"
            />
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-32">
        <h1 className="text-xl md:text-2xl font-display font-black tracking-tight text-neutral-800 mb-5 md:mb-8">The Holy <span className="text-[#00695C]">Quran</span></h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">

          {filteredSurahs.map((s, idx) => {
             // Calculate staggering for visible rows roughly
             const delay = Math.min(idx * 0.04, 1.5); // cap delay to 1.5s so it doesn't wait forever to load bottom cards
             
             return (
               <div 
                 key={s.id}
                 onClick={() => navigate(`/quran/${s.id}`)}
                 className="group relative w-full h-[220px] rounded-[28px] overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.03] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,105,92,0.15)] bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white hover:border-[#00695C]/30"
                 style={{
                    animation: `fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    opacity: 0,
                    animationDelay: `${delay}s`
                 }}
               >
                   {/* Top Highlight line */}
                   <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#00695C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                   {/* Background Watermark Arabic Layer */}
                   <div className="absolute -right-6 -bottom-12 text-[140px] font-arabic leading-none text-[#00695C] opacity-[0.02] select-none pointer-events-none group-hover:scale-110 group-hover:opacity-[0.04] group-hover:-translate-y-4 group-hover:-rotate-3 transition-all duration-[1500ms] drop-shadow-xl" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.2)' }}>
                      {s.name_arabic}
                   </div>

                   {/* Glass Content Container */}
                   <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                       
                       {/* Top Metadata Row */}
                       <div className="flex items-start justify-between">
                           <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-white/90 to-white/40 flex items-center justify-center border border-white text-[#00695C] font-display font-black text-xl shadow-sm group-hover:bg-gradient-to-br group-hover:from-[#00695C] group-hover:to-[#004d40] group-hover:text-white group-hover:border-[#00695C] transition-all duration-500">
                               {s.id}
                           </div>
                           <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white shadow-sm group-hover:bg-[#00695C]/5 transition-colors">
                                   <Hexagon size={10} className="text-[#00695C]" />
                                   <span className="text-[9px] uppercase font-black tracking-widest text-neutral-600 group-hover:text-[#00695C]">{s.revelation_place}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white shadow-sm group-hover:bg-[#00695C]/5 transition-colors">
                                   <Layers size={10} className="text-[#AEEA00]" />
                                   <span className="text-[9px] uppercase font-black tracking-widest text-neutral-600 group-hover:text-[#00695C]">{s.verses_count} Verses</span>
                                </div>
                           </div>
                       </div>

                       {/* Bottom Titles */}
                       <div className="w-full flex items-end justify-between">
                           <div className="flex flex-col">
                               <h2 className="text-2xl font-display font-black text-neutral-800 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00695C] group-hover:to-[#AEEA00] transition-all duration-500">
                                   {s.name_simple}
                               </h2>
                               <span className="text-xs font-medium text-neutral-400 max-w-[140px] truncate block opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 mt-1">
                                  Jump right in
                               </span>
                           </div>
                           <div className="text-3xl font-arabic text-[#00695C]/40 group-hover:text-[#00695C] group-hover:scale-110 transition-all duration-700 drop-shadow-md pb-1">
                               {s.name_arabic}
                           </div>
                       </div>

                   </div>
               </div>
             );
          })}

          {filteredSurahs.length === 0 && (
             <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-0 animate-[fadeSlideUp_0.8s_ease-out_forwards]">
                <div className="w-24 h-24 mb-6 rounded-full bg-white/50 backdrop-blur-xl border border-white shadow-lg flex items-center justify-center text-[#00695C]/30 text-5xl">
                   <Search />
                </div>
                <h3 className="font-display font-black text-3xl text-neutral-700 mb-2">No chapters found</h3>
                <p className="text-neutral-500 font-medium">We couldn't find a match for '{searchQuery}'.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quran;