import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReflectionHistory from "../components/ReflectionHistory";
import { ChevronLeft, X, Check, History } from "lucide-react";
import logoOfficial from "../assets/logo_official.png";
import { updateReflection } from "../services/nudgeService";

const Reflections: React.FC = () => {
  const navigate = useNavigate();
  
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

  // Check for updates from other components (like DailyNudge)

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
           <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Spiritual Archive</span>
           <h2 className="text-5xl font-display font-bold text-secondary tracking-tight italic">My Favorites</h2>
           <p className="text-neutral-400 font-light italic leading-relaxed max-w-lg text-lg">
            "And remind, for indeed, the reminder benefits the believers." <span className="text-primary font-bold">(51:55)</span>
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <ReflectionHistory refreshTrigger={refreshTrigger} />
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
    </div>
  );
};

export default Reflections;
