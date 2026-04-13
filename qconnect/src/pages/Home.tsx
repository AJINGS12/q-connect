import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import DailyNudge from '../components/DailyNudge';
import { 
  Search, Menu, X, BookOpen, Award, PenLine, 
  Settings, User, ChevronRight, Bell, History,
  Gamepad2, LogOut, Shield, Mail, Check
} from 'lucide-react';
import { updateReflection } from '../services/nudgeService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // --- ADDED FOR EDITING ---
  const [selectedRef, setSelectedRef] = useState<any>(null);
  const [editText, setEditText] = useState("");

  // Quran search states
  const [searchQuery, setSearchQuery] = useState("");
  const [surahList, setSurahList] = useState<any[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchHomeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserAuth(user);
      const { data: profileData } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const { data: refData } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      setReflections(refData || []);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchHomeData().then(() => setLoading(false));

    const fetchSurahList = async () => {
      try {
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=en");
        const data = await res.json();
        setSurahList(data.chapters);
      } catch (e) { console.error(e); }
    };
    fetchSurahList();
  }, []);

  // Listen for reflection updates from DailyNudge component
  useEffect(() => {
    const checkForReflectionUpdates = () => {
      const lastUpdate = localStorage.getItem('reflectionsUpdated');
      if (lastUpdate) {
        console.log('Home page: Detected reflection update, reloading reflections...');
        fetchHomeData();
        localStorage.removeItem('reflectionsUpdated');
      }
    };

    // Check immediately and then every 2 seconds
    checkForReflectionUpdates();
    const interval = setInterval(checkForReflectionUpdates, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // --- ADDED UPDATE HANDLER ---
  const handleUpdate = async () => {
    if (!selectedRef || !editText.trim()) return;
    setIsSaving(true);
    const { success } = await updateReflection(selectedRef.id, editText);
    if (success) {
      await fetchHomeData();
      setSelectedRef(null);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsProfileModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs([]);
    } else {
      const filtered = surahList.filter((s) =>
        s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toString() === searchQuery
      ).slice(0, 5); 
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahList]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = userAuth?.user_metadata?.full_name || userAuth?.user_metadata?.name || "User";
  const firstName = displayName.split(' ')[0];
  const userAvatar = userAuth?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-body text-secondary transition-all">
      
      {/* --- SIDEBAR MENU --- */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-72 bg-white h-full shadow-2xl p-8 flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-primary"><X size={20}/></button>
          <h2 className="font-display text-2xl text-primary mb-10 text-[#00695C]">QConnect</h2>
          <nav className="space-y-2 flex-grow">
            {[
              { icon: <BookOpen size={20}/>, label: "The Quran", path: "/quran" },
              { icon: <Gamepad2 size={20}/>, label: "Knowledge Quest", path: "/quest" },
              { icon: <History size={20}/>, label: "My Reflections", path: "/reflections" },
              { icon: <Award size={20}/>, label: "Badges", path: "/badges" },
              { icon: <Settings size={20}/>, label: "Settings", path: "/settings" },
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => {
                    if(item.path) navigate(item.path);
                    setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#00695C]/5 hover:text-[#00695C] transition-all text-neutral-600 font-medium text-sm text-left"
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* --- TOP NAV --- */}
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-100/50 py-2">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => setIsMenuOpen(true)} className="p-3 hover:bg-neutral-100 rounded-2xl transition-all active:scale-90 text-[#00695C]">
              <Menu size={26} />
            </button>
            <div className="hidden md:block">
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Welcome back</p>
               <p className="text-sm font-bold text-secondary">{firstName}</p>
            </div>
          </div>
          
          <div className="flex-grow relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#00695C] transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Surah Name..." 
              className="w-full bg-white border-2 border-neutral-100 py-4 pl-14 pr-6 rounded-[30px] shadow-sm focus:border-[#00695C]/30 focus:outline-none transition-all font-light text-md text-secondary"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 relative" ref={modalRef}>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-lg leading-none">🪙</span>
              <span className="text-sm font-black text-amber-700 leading-none">{profile?.quest_coins || 0}</span>
            </div>
            
            <button 
              onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
              className="w-12 h-12 rounded-[20px] bg-[#00695C]/10 border border-[#00695C]/5 flex items-center justify-center text-[#00695C] font-bold shadow-sm overflow-hidden active:scale-95 transition-all"
            >
              {(userAvatar && !imgError) ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <span className="uppercase">{firstName.charAt(0)}</span>
              )}
            </button>

            {isProfileModalOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl border border-neutral-100 p-6 z-[100] animate-in zoom-in-95 duration-200">
                <div className="text-center border-b border-neutral-50 pb-6 mb-6">
                  <div className="w-20 h-20 rounded-[28px] bg-teal-50 mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                    {(userAvatar && !imgError) ? <img src={userAvatar} className="w-full h-full object-cover" /> : <span className="text-2xl text-[#00695C] font-bold uppercase">{firstName.charAt(0)}</span>}
                  </div>
                  <h3 className="font-bold text-secondary text-lg">{displayName}</h3>
                  <p className="text-xs text-neutral-400">{userAuth?.email}</p>
                </div>
                <div className="space-y-1">
                   <button onClick={() => { navigate('/settings'); setIsProfileModalOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 text-sm font-medium text-neutral-600 transition-colors">
                      <Shield size={18} /> Account Security
                   </button>
                   <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-500 transition-colors">
                      <LogOut size={18} /> Sign Out
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-16">
        <section className="animate-in fade-in slide-in-from-top duration-700">
           <DailyNudge />
        </section>

        {/* --- DYNAMIC CONTINUE READING --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">In Progress</span>
          </div>
          <h2 className="text-3xl font-display text-secondary">Continue Reading</h2>
          <div onClick={() => navigate(`/quran/${profile?.last_surah_num || '1'}`)} className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 md:gap-12 items-center border border-white group cursor-pointer hover:shadow-md transition-all">
            <div className="w-full md:w-80 aspect-square rounded-[36px] overflow-hidden shadow-2xl shadow-neutral-200 bg-neutral-100">
              <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
            <div className="flex-grow space-y-7 w-full">
              <div className="flex items-center gap-3">
                <span className="bg-[#00695C]/10 text-[#00695C] px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider">Surah {profile?.last_surah_num || '1'}</span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-tight uppercase">Resume Reading</span>
              </div>
              <div>
                <h3 className="text-5xl font-display text-[#00695C] tracking-tight italic">{profile?.last_surah_name || 'Al-Fatihah'}</h3>
              </div>
              <button className="bg-[#00695C] text-white px-10 py-5 rounded-[22px] flex items-center gap-3 font-bold text-sm hover:bg-[#004d40] transition-all">
                Resume <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* --- QUEST ACCESS --- */}
        <section onClick={() => navigate('/quest')} className="bg-[#00695C] rounded-[40px] p-8 text-white shadow-xl cursor-pointer hover:scale-[1.01] transition-all group relative overflow-hidden text-left">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">New Challenge</span>
              <h2 className="text-3xl font-display font-bold">Knowledge Quest</h2>
            </div>
            <ChevronRight size={24} />
          </div>
          <Gamepad2 size={120} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
        </section>

        {/* --- JOURNAL --- */}
        <section className="space-y-10">
          <h2 className="text-3xl font-display text-secondary">Recent Reflections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reflections.map((ref) => (
              <div 
                key={ref.id} 
                onClick={() => {
                  setSelectedRef(ref);
                  setEditText(ref.reflection_text);
                }}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-transparent hover:border-[#00695C]/10 transition-all group flex flex-col min-h-[340px] cursor-pointer active:scale-95"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </span>
                  <PenLine size={18} className="text-neutral-200 group-hover:text-[#00695C] transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-[#00695C] mb-5 uppercase tracking-tight">Verse {ref.verse_key}</h4>
                <p className="text-md text-neutral-500 italic line-clamp-5 leading-relaxed">"{ref.reflection_text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- MODAL FOR EDITING --- */}
        {selectedRef && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRef(null)} />
            <div className="relative bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold text-[#00695C]">Review Reflection</h3>
                <button onClick={() => setSelectedRef(null)} className="p-2 hover:bg-neutral-50 rounded-full"><X size={20} className="text-neutral-400" /></button>
              </div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Verse {selectedRef.verse_key}</label>
              <textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-48 p-6 bg-neutral-50 rounded-[24px] border-none focus:ring-2 focus:ring-[#00695C]/20 text-secondary italic leading-relaxed transition-all resize-none mb-8"
              />
              <button 
                onClick={handleUpdate}
                disabled={isSaving || editText === selectedRef.reflection_text}
                className="w-full bg-[#00695C] text-white py-5 rounded-[24px] font-bold shadow-xl shadow-[#00695C]/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? "Updating..." : <><Check size={18}/> Update Entry</>}
              </button>
            </div>
          </div>
        )}

        <footer className="py-20 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-300">
             © 2026 QConnect • Crafted for Wisdom
           </p>
        </footer>
      </main>
    </div>
  );
};

export default Home;