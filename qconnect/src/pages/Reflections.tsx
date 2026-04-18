import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReflectionHistory from "../components/ReflectionHistory";
import { ChevronLeft, X, Check, History } from "lucide-react";
import logoOfficial from "../assets/logo_official.png";
import { updateReflection } from "../services/nudgeService";

const Reflections: React.FC = () => {
  const navigate = useNavigate();
  
  // --- STATES FOR EDITING ---
  const [selectedRef, setSelectedRef] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check for updates from other components (like DailyNudge)
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('reflectionsUpdated');
      if (lastUpdate) {
        console.log('Detected reflections update, refreshing...');
        setRefreshTrigger(prev => prev + 1);
        localStorage.removeItem('reflectionsUpdated');
      }
    };

    // Check immediately and then every 2 seconds
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // This function will be passed to ReflectionHistory to "catch" the click
  const handleEditClick = (ref: any) => {
    setSelectedRef(ref);
    setEditText(ref.reflection_text);
  };

  const handleUpdate = async () => {
    if (!selectedRef || !editText.trim()) return;
    setIsSaving(true);
    const { success } = await updateReflection(selectedRef.id, editText);
    if (success) {
      setSelectedRef(null);
      // Optional: You might need a window.location.reload() 
      // here if ReflectionHistory doesn't auto-refresh
      window.location.reload(); 
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft pb-12 font-body transition-all duration-700">
      {/* Navigation Header */}
      <nav className="glass-panel sticky top-0 z-50 py-6 px-8 border-none bg-white/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center text-neutral-400 hover:text-primary transition-all group shrink-0"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 group-hover:border-primary/30 shadow-sm transition-all">
               <ChevronLeft size={18} className="text-primary" />
            </div>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-grow max-w-4xl mx-auto px-6 pt-16 w-full">
        <div className="mb-16 space-y-4">
           <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Continuous Reflection</span>
           <h2 className="text-5xl font-display font-bold text-secondary tracking-tight italic">My Journey</h2>
           <p className="text-neutral-400 font-light italic leading-relaxed max-w-lg text-lg">
            "And remind, for indeed, the reminder benefits the believers." <span className="text-primary font-bold">(51:55)</span>
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <ReflectionHistory onEdit={handleEditClick} refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <footer className="mt-auto py-20 border-t border-neutral-100 px-6 md:px-10 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-neutral-100 rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-2 grayscale opacity-50">
                 <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-secondary opacity-100">QConnect</span>
           </div>
           <div className="flex gap-12">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
           </div>
        </div>
      </footer>

      {/* --- EDIT / VIEW MODAL --- */}
      {selectedRef && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" 
            onClick={() => setSelectedRef(null)} 
          />
          
          <div className="relative bg-white rounded-premium-card p-10 md:p-12 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white border border-neutral-100 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                  <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-secondary">Review Entry</h3>
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em] mt-1">Verse {selectedRef.verse_key}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRef(null)} 
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-neutral-300" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Verse Context (Enriched data from ReflectionHistory) */}
              <div className="bg-neutral-50/50 rounded-[32px] p-8 border border-neutral-100/50 relative overflow-hidden">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Original Context</p>
                 <div className="space-y-6">
                    <p dir="rtl" className="font-arabic text-3xl text-right text-secondary leading-relaxed">
                       {selectedRef.arabic}
                    </p>
                    <div className="border-l-2 border-primary/20 pl-4">
                      <p className="text-sm text-neutral-500 italic leading-relaxed">
                         "{selectedRef.translation?.replace(/<[^>]*>?/gm, '')}"
                      </p>
                    </div>
                 </div>
              </div>

              {/* Editable Reflection Area */}
              <div>
                <label className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em] block mb-4 ml-2">Personal Insight</label>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-52 p-8 bg-white rounded-[32px] border-2 border-neutral-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none text-secondary italic leading-relaxed transition-all resize-none shadow-inner"
                  placeholder="What does this mean to you today?"
                />
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => setSelectedRef(null)}
                   className="px-8 py-5 rounded-2xl font-bold text-xs text-neutral-400 uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handleUpdate}
                   disabled={isSaving || editText === selectedRef.reflection_text}
                   className="flex-grow bg-primary text-white py-5 rounded-[22px] font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40 disabled:shadow-none"
                 >
                   {isSaving ? "Syncing Wisdom..." : <><Check size={18}/> Update Archive</>}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reflections;