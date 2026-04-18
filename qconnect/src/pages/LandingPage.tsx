import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen } from 'lucide-react';

// --- IMAGE IMPORTS ---
import logoOfficial from '../assets/logo_official.png'; 
import contextualImg from '../assets/contextual.jpg';
import journalImg from '../assets/journal.jpg';
import badgesImg from '../assets/badges.png';
import quranImg from '../assets/quran.jpg';
import bookmarkSyncImg from '../assets/bookmark_sync.jpg';
import knowledgeQuestImg from '../assets/knowledge_quest.jpg';

const features = [
  {
    title: "Contextual Nudges",
    description: "Beyond Ramadan. QConnect sends timely, theme-based reminders (Morning, Afternoon, Evening) to keep the Quran's wisdom integrated into your daily rhythm.",
    image: contextualImg,
    bgColor: "bg-[#E0F2F1]" 
  },
  {
    title: "Micro-Reflection Journal",
    description: "Don't just read—absorb. After every verse, a gentle prompt asks: 'What does this mean to you today?' Build a living map of your spiritual evolution.",
    image: journalImg,
    bgColor: "bg-[#E8F5E9]"
  },
  {
    title: "Surah-Based Badges",
    description: "Unlock iconic badges like Fatiha (Guidance) or Ikhlas (Tauhid) by reading and reflecting. Transform your progress into a visual collection of milestones.",
    image: badgesImg,
    bgColor: "bg-[#FFF8E1]"
  },
  {
    title: "Quran.com Bookmark Sync",
    description: "Connect your Quran.com account with one tap. Every ayah you bookmark in QConnect syncs to Quran.com—and vice versa. Your reading journey, on every device.",
    image: bookmarkSyncImg,
    bgColor: "bg-[#E0F2F1]"
  },
  {
    title: "Knowledge Quest",
    description: "Turn Quranic knowledge into an adventure. Complete daily challenges, answer verse-based quizzes, and earn Quest Coins to unlock rewards. Learning has never felt this alive.",
    image: knowledgeQuestImg,
    bgColor: "bg-[#FFF3E0]"
  },
];

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      },
    });
    if (error) console.error("Auth error:", error.message);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft pb-24 font-body transition-all duration-700">
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-none shadow-none bg-white/40">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-neutral-100 overflow-hidden p-1">
                <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-secondary">QConnect</span>
          </div>
          <button 
            onClick={handleGoogleLogin}
            className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-6 py-2.5 rounded-xl transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-grow pt-32">
        {/* --- HERO SECTION --- */}
        <section className="pt-20 pb-32 px-6 text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase block mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">Beyond Ramadan Engagement</span>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold text-secondary leading-[1] mb-10 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            A daily living <br /> 
            <span className="italic font-light text-primary">companion.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-neutral-400 mb-16 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Embedding Quranic wisdom into your everyday life through contextual nudges, micro-reflections, and gamified quests.
          </p>
          <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button 
              onClick={handleGoogleLogin}
              className="group relative flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full text-base font-bold shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-primary/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5 relative z-10" alt="Google" />
              <span className="relative z-10">Sign in with Google</span>
            </button>
            <p className="mt-6 text-[10px] uppercase font-bold tracking-widest text-neutral-400 max-w-sm mx-auto text-center">
              By signing in, you agree to our <a href="/terms" className="text-primary hover:underline">Terms</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </section>

        {/* --- DYNAMIC FEATURE CAROUSEL --- */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 block mb-3">Core Modules</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary italic">The QConnect Experience</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center premium-card p-10 md:p-20 rounded-[48px] border-none shadow-2xl shadow-primary/5 bg-white/60 backdrop-blur-md">
            <div className={`aspect-square rounded-[40px] flex items-center justify-center overflow-hidden transition-all duration-1000 ${features[activeTab].bgColor} shadow-2xl relative group`}>
                <img 
                  key={activeTab} 
                  src={features[activeTab].image} 
                  alt={features[activeTab].title} 
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" 
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="space-y-12">
              <div className="flex gap-3">
                {features.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`h-1.5 rounded-full transition-all duration-700 ${activeTab === idx ? 'w-20 bg-primary' : 'w-6 bg-neutral-100 hover:bg-neutral-200'}`}
                  />
                ))}
              </div>
              
              <div className="min-h-[220px] space-y-6">
                <h3 className="text-4xl font-display font-bold text-primary italic leading-tight">{features[activeTab].title}</h3>
                <p className="text-xl text-neutral-400 leading-relaxed font-light">
                  {features[activeTab].description}
                </p>
              </div>

              <div className="pt-6">
                <button    onClick={handleGoogleLogin} className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary group active:scale-95 transition-all">
                  Sign in with Google 
                  <span className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all group-hover:translate-x-3">→</span>
                </button>
                <p className="mt-4 text-[10px] font-bold text-neutral-400">
                  By continuing, you accept our <a href="/terms" className="text-primary hover:underline">Terms</a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- MISSION SECTION --- */}
        <section className="py-32 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center border-t border-neutral-100/50">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[52px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="rounded-[48px] overflow-hidden shadow-2xl aspect-[4/5] bg-neutral-100 border border-white relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]">
              <img 
                src={quranImg} 
                alt="Sacred Text" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
              />
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-2">
               <span className="text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase block">Project Philosophy</span>
               <h2 className="text-5xl md:text-6xl font-display font-bold text-secondary leading-[1.1] italic">
                 From ritual <br />to reality.
               </h2>
            </div>
            <p className="text-xl text-neutral-400 leading-relaxed font-light max-w-xl">
              The Quran shouldn't just be read; it should be lived. QConnect ensures the Message is always within reach, bridging the gap between sacred moments and everyday life.
            </p>
            <div className="pt-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <p className="text-3xl font-bold font-display text-primary">24/7</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Contextual Integration</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-3xl font-bold font-display text-primary">Live</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Reflection Sync</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto py-20 border-t border-neutral-100 px-10 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-neutral-100 rounded-lg flex items-center justify-center grayscale opacity-50 overflow-hidden p-2 shadow-sm">
                <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
             </div>
             <span>© 2026 QConnect • The Sacred Breath</span>
          </div>
          <div className="flex gap-12">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Sequence API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;