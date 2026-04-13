import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- IMAGE IMPORTS ---
import logo from '../assets/logo.png'; 
import contextualImg from '../assets/contextual.jpg';
import journalImg from '../assets/journal.jpg';
import badgesImg from '../assets/badges.png';
import quranImg from '../assets/quran.jpg';

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
  }
];

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
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
    <div className="min-h-screen flex flex-col bg-bg-light font-body">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <img src={logo} alt="QConnect Logo" className="h-16 w-auto object-contain" />
        </div>
      </header>

      <main className="flex-grow">
        {/* --- HERO SECTION --- */}
        <section className="pt-12 pb-20 px-6 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-display text-primary leading-[1.1] mb-8">
            A daily living <br /> 
            <span className="italic">companion.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-neutral-main mb-12 leading-relaxed">
            While engagement often fades after Ramadan, QConnect bridges the gap—embedding Quranic wisdom into your everyday life through contextual nudges and reflection.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-3 bg-[#00695C] text-white px-14 py-5 rounded-full text-lg font-bold shadow-xl hover:shadow-[#00695C]/30 transition-all hover:-translate-y-1 active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white rounded-full p-1" alt="Google" />
              Continue with Google
            </button>
          </div>
        </section>

        {/* --- DYNAMIC FEATURE CAROUSEL --- */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase block mb-2">What sets us apart</span>
            <h2 className="text-4xl font-display text-secondary">The QConnect Experience</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-neutral-100">
            <div className={`aspect-square rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-700 ${features[activeTab].bgColor} border border-neutral-50 shadow-inner`}>
                <img 
                  key={activeTab} 
                  src={features[activeTab].image} 
                  alt={features[activeTab].title} 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" 
                />
            </div>

            <div className="space-y-8">
              <div className="flex gap-2">
                {features.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeTab === idx ? 'w-12 bg-[#00695C]' : 'w-4 bg-neutral-200'}`}
                  />
                ))}
              </div>
              
              <div className="min-h-[200px]">
                <h3 className="text-3xl font-display text-primary mb-4">{features[activeTab].title}</h3>
                <p className="text-xl text-neutral-main leading-relaxed font-light">
                  {features[activeTab].description}
                </p>
              </div>

              <div className="pt-4">
                <button className="text-[#00695C] font-bold flex items-center gap-2 group uppercase text-xs tracking-widest">
                  Discover {features[activeTab].title} <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- MISSION SECTION --- */}
        <section className="py-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center border-t border-neutral-100">
          <div className="relative">
            <div className="rounded-[40px] overflow-hidden shadow-2xl aspect-[4/5] bg-neutral-100 border border-neutral-200">
              <img 
                src={quranImg} 
                alt="Sacred Text" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          <div className="space-y-8">
            <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase">Our Mission</span>
            <h2 className="text-4xl md:text-5xl font-display text-secondary leading-tight">
              From ritual to <br />reality.
            </h2>
            <p className="text-xl text-neutral-main leading-relaxed font-light">
              We believe the Quran shouldn't just be read; it should be lived. Our multimodal approach—reading, listening, and reflecting—ensures the Message is always within reach, no matter how busy your day is.
            </p>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-neutral-100 px-10 bg-bg-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-main">
          <div>© 2026 QConnect. The Sacred Breath.</div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;