import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReflectionHistory from "../components/ReflectionHistory";
import { ChevronLeft, X, Check, BookOpen } from "lucide-react";
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
    <div className="min-h-screen bg-[#F3F5F7] pb-12 font-body">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-neutral-100 py-6 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-neutral-400 hover:text-[#00695C] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
          </button>
          <h1 className="font-display text-lg font-bold text-[#00695C]">Spiritual Journal</h1>
          <div className="w-10" />
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="mb-12">
          <h2 className="text-4xl font-display font-bold text-secondary mb-3 tracking-tight">My Journey</h2>
          <p className="text-neutral-500 font-light italic leading-relaxed max-w-lg">
            "And remind, for indeed, the reminder benefits the believers." <span className="text-[#00695C] font-medium">(51:55)</span>
          </p>
        </div>

        {/* NOTE: You must update ReflectionHistory.tsx to accept an 'onEdit' prop 
           and call it when a card is clicked!
        */}
        <ReflectionHistory onEdit={handleEditClick} refreshTrigger={refreshTrigger} />
      </main>

      {/* --- EDIT / VIEW MODAL --- */}
      {selectedRef && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setSelectedRef(null)} 
          />
          
          <div className="relative bg-white rounded-[40px] p-8 md:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00695C]/10 rounded-xl flex items-center justify-center text-[#00695C]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-secondary">Review Entry</h3>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Verse {selectedRef.verse_key}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRef(null)} 
                className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
              >
                <X size={20} className="text-neutral-300" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Verse Context (Translation area) */}
              <div className="bg-neutral-50 rounded-[28px] p-6 border border-neutral-100/50">
                 <p className="text-[10px] font-bold text-[#00695C] uppercase tracking-widest mb-2">Original Context</p>
                 <p className="text-sm text-secondary leading-relaxed font-light italic">
                    {/* If your Supabase stores the translation, show it here */}
                    Viewing the wisdom behind Verse {selectedRef.verse_key}...
                 </p>
              </div>

              {/* Editable Reflection Area */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-3 ml-2">Your Reflection</label>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-48 p-7 bg-white rounded-[32px] border-2 border-neutral-100 focus:border-[#00695C]/30 focus:outline-none text-secondary italic leading-relaxed transition-all resize-none shadow-inner"
                />
              </div>

              <button 
                onClick={handleUpdate}
                disabled={isSaving || editText === selectedRef.reflection_text}
                className="w-full bg-[#00695C] text-white py-5 rounded-[24px] font-bold shadow-xl shadow-[#00695C]/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:shadow-none"
              >
                {isSaving ? "Syncing Wisdom..." : <><Check size={18}/> Update Journal</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reflections;