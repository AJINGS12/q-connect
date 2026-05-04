import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import DailyNudge from '../components/DailyNudge';
import { 
  Search, Menu, X, BookOpen, Award, Heart, 
  Settings, User, ChevronRight, Bell, History,
  Gamepad2, LogOut, Shield, Mail, Check, BookmarkPlus, Activity, Users
} from 'lucide-react';
import quranImg from '../assets/quran.jpg';
import logoOfficial from '../assets/logo_official.png';

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

  // Quran search states
  const [searchQuery, setSearchQuery] = useState("");
  const [surahList, setSurahList] = useState<any[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<any[]>([]);

  const fetchHomeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserAuth(user);
      const { data: profileData } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (!profileData || !profileData.role) {
         navigate('/onboarding', { replace: true });
         return false;
      }
      
      setProfile(profileData);
      console.log('Home: User Profile State:', {
        last_surah_num: profileData?.last_surah_num,
        last_surah_name: profileData?.last_surah_name,
        has_started: !!(profileData?.last_surah_num && parseInt(profileData.last_surah_num) > 0)
      });

      const { data: refData } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      setReflections(refData || []);
      return true;
    }
    return true;
  };

  useEffect(() => {
    setLoading(true);
    fetchHomeData().then((shouldStopLoading) => {
      if (shouldStopLoading !== false) {
        setLoading(false);
      }
    });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Only show "Continue Reading" if the user has a surah number AND a surah name (verified progress)
  const hasStarted = !!(profile?.last_surah_num && profile?.last_surah_name);

  return (
    <div className="min-h-screen bg-bg-soft font-body text-secondary transition-all">
      
      {/* --- SIDEBAR MENU --- */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-72 bg-white h-full shadow-2xl p-8 flex flex-col overflow-y-auto scrollbar-hide transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-neutral-50 rounded-full"><X size={20}/></button>
          <div className="flex items-center gap-3 mb-12 mt-4">
             <div className="w-10 h-10 bg-white border border-neutral-100 rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
             </div>
             <h2 className="font-display text-2xl font-bold text-primary">QConnect</h2>
          </div>
          <nav className="space-y-2 flex-grow">
            {[
              { icon: <BookOpen size={20}/>, label: "The Quran", path: "/quran" },
              { icon: <Search size={20}/>, label: "Wisdom Search", path: "/search" },
              { icon: <BookmarkPlus size={20}/>, label: "My Bookmarks", path: "/bookmarks" },
              { icon: <Gamepad2 size={20}/>, label: "Knowledge Quest", path: "/quest" },
              { icon: <Activity size={20}/>, label: "Spiritual Insights", path: "/insights" },
              { icon: <Users size={20}/>, label: "Social Cycle", path: "/social" },
              { icon: <Heart size={20}/>, label: "My Favorites", path: "/reflections" },
              { icon: <Bell size={20}/>, label: "My Reminders", path: "/reminders" },
              { icon: <Settings size={20}/>, label: "Settings", path: "/settings" },
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => {
                    if(item.path) navigate(item.path);
                    setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-[20px] hover:bg-primary/5 hover:text-primary transition-all text-neutral-500 font-medium text-sm text-left group"
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* --- TOP NAV --- */}
      <nav className="glass-panel sticky top-0 z-50 py-3">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex items-center gap-3 md:gap-8">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-neutral-50 border border-neutral-100/50 rounded-xl md:rounded-2xl transition-all active:scale-95 text-primary bg-white shadow-sm">
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="hidden md:block">
               <p className="text-sm font-bold text-secondary">Peace be upon you, {firstName}</p>
            </div>
          </div>
          
          <div className="flex-grow relative group max-w-xl mx-auto">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Surahs..." 
              className="w-full bg-neutral-50/50 border border-neutral-100 py-2 md:py-3.5 pl-10 md:pl-14 pr-4 md:pr-6 rounded-xl md:rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-light text-xs md:text-sm text-secondary"
            />
            
            {filteredSurahs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {filteredSurahs.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => navigate(`/quran/${s.id}`)}
                    className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xs">{s.id}</div>
                      <div className="text-left">
                        <p className="font-bold text-secondary">{s.name_simple}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{s.revelation_place} • {s.verses_count} Verses</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-200" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 shrink-0 relative" ref={modalRef}>
            <button 
              onClick={() => navigate('/quest')}
              className="flex items-center gap-1.5 md:gap-2.5 bg-amber-50 border border-amber-100 px-2 py-1.5 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
            >
              <span className="text-sm md:text-lg leading-none transition-transform group-hover:scale-125">🪙</span>
              <span className="text-[10px] md:text-xs font-black text-amber-700">{profile?.quest_coins || 0}</span>
            </button>
            
            <button 
              onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-primary font-bold shadow-sm overflow-hidden active:scale-95 transition-all hover:border-primary/20"
            >
              {(userAvatar && !imgError) ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <span className="uppercase text-sm tracking-tighter">{firstName.charAt(0)}</span>
              )}
            </button>

            {isProfileModalOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-premium-card shadow-2xl border border-neutral-100 p-8 z-[100] animate-in slide-in-from-top-4 duration-300">
                <div className="text-center border-b border-neutral-50 pb-8 mb-6">
                  <div className="w-24 h-24 rounded-[32px] bg-primary/5 mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                    {(userAvatar && !imgError) ? <img src={userAvatar} className="w-full h-full object-cover" /> : <span className="text-3xl text-primary font-bold uppercase">{firstName.charAt(0)}</span>}
                  </div>
                  <h3 className="font-bold text-secondary text-lg">{displayName}</h3>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Believer</p>
                </div>
                <div className="space-y-1">
                   <button onClick={() => { navigate('/settings'); setIsProfileModalOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 text-xs font-bold text-neutral-500 transition-all uppercase tracking-widest">
                      <Settings size={16} /> Preferences
                   </button>
                   <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-xs font-bold text-red-500 transition-all uppercase tracking-widest">
                      <LogOut size={16} /> Sign Out
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 space-y-20 pb-32">
        <section className="animate-in fade-in slide-in-from-top-8 duration-1000">
           <DailyNudge />
        </section>

        {/* --- DYNAMIC JOURNEY SECTION --- */}
        {!hasStarted ? (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">New Journey</span>
              <h2 className="text-3xl font-display font-bold text-secondary">Start Your Journey</h2>
            </div>

            <div 
              onClick={() => navigate('/quran')} 
              className="premium-card p-10 md:p-14 flex flex-col md:flex-row gap-12 items-center group cursor-pointer active:scale-[0.99] relative overflow-hidden bg-primary text-white border-none"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="w-full md:w-96 aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl relative z-10 border-4 border-white/20">
                <img src={quranImg} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                   <p className="text-white text-lg font-display font-medium italic">Begin with the Wisdom of the Ages</p>
                </div>
              </div>

              <div className="flex-grow space-y-8 w-full relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/60 font-black tracking-[0.3em] uppercase">Ready to Begin?</p>
                  <h3 className="text-5xl font-display font-bold text-white tracking-tight">Explore the Quran</h3>
                </div>
                
                <p className="text-lg text-white/80 font-light leading-relaxed max-w-md">
                   Discover the divine guidance tailored to your journey. Start reading today and capture your first reflection.
                </p>

                <button className="bg-white text-primary pl-12 pr-10 py-5 rounded-[22px] flex items-center gap-8 font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-95 transition-all group/btn">
                  Start Reading 
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:translate-x-2 transition-transform">
                    <ChevronRight size={18} />
                  </span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Latest Journey</span>
                <h2 className="text-3xl font-display font-bold text-secondary">Continue Reading</h2>
              </div>
              <button onClick={() => navigate('/quran')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">View All Surahs →</button>
            </div>

            <div 
              onClick={() => navigate(`/quran/${profile?.last_surah_num || '1'}`)} 
              className="premium-card p-10 md:p-14 flex flex-col md:flex-row gap-12 items-center group cursor-pointer active:scale-[0.99] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="w-full md:w-96 aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl relative z-10">
                <img src={quranImg} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                   <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest">Surah {profile?.last_surah_num || '1'}</div>
                </div>
              </div>

              <div className="flex-grow space-y-8 w-full relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-primary font-black tracking-[0.3em] uppercase">My Progress</p>
                  <h3 className="text-5xl font-display font-bold text-secondary tracking-tight group-hover:text-primary transition-colors">{profile?.last_surah_name || 'Al-Fatihah'}</h3>
                </div>
                
                <div className="flex items-center gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Progress</p>
                      <p className="text-lg font-bold text-secondary italic">Part of Chapter {Math.ceil((parseInt(profile?.last_surah_num) || 1) / 4)}</p>
                   </div>
                   <div className="w-px h-10 bg-neutral-100" />
                   <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Last Read</p>
                      <p className="text-lg font-bold text-secondary">Today</p>
                   </div>
                </div>

                <button className="bg-primary text-white pl-12 pr-10 py-5 rounded-[22px] flex items-center gap-8 font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all group/btn">
                  Resume Wisdom 
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-2 transition-transform">
                    <ChevronRight size={18} />
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- EXPERIENCE GRID: QUEST + BOOKMARKS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section 
            onClick={() => navigate('/quest')} 
            className="premium-card p-10 h-72 flex flex-col justify-between group cursor-pointer bg-primary text-white border-none shadow-primary/10 hover:shadow-primary/30 relative"
          >
            <div className="absolute top-0 right-0 p-8 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
              <Gamepad2 size={120} />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Level {profile?.current_quest_level || 1}</span>
              <h2 className="text-3xl font-display font-bold">Knowledge <br/>Quest</h2>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-sm font-medium text-white/70">Test your wisdom & earn rewards</p>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ChevronRight size={20} />
              </div>
            </div>
          </section>

          <section 
            onClick={() => navigate('/bookmarks')} 
            className="premium-card p-10 h-72 flex flex-col justify-between group cursor-pointer relative"
          >
             <div className="absolute top-0 right-0 p-8 text-primary/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
              <BookmarkPlus size={120} />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Quran.com Sync</span>
              <h2 className="text-3xl font-display font-bold text-secondary">Bookmarks <br/>Library</h2>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-400">Your sacred collection, synced live</p>
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform">
                <ChevronRight size={20} />
              </div>
            </div>
          </section>
        </div>

        {/* --- JOURNAL --- */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Spiritual Archive</span>
              <h2 className="text-3xl font-display font-bold text-secondary">My Favorites</h2>
            </div>
            <button onClick={() => navigate('/reflections')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">View All →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reflections.length > 0 ? reflections.map((ref) => (
              <div 
                key={ref.id} 
                onClick={() => {
                  const surahNum = ref.verse_key.split(':')[0];
                  navigate(`/quran/${surahNum}`);
                }}
                className="bg-white p-10 rounded-premium-card shadow-sm border border-neutral-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col min-h-[360px] cursor-pointer active:scale-95 relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 text-primary/5 p-4 group-hover:scale-110 transition-transform"><Heart size={80} /></div>
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="bg-primary/5 px-3 py-1.5 rounded-lg">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                      {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Verse {ref.verse_key}</h4>
                  <p className="text-xl text-secondary italic font-light leading-relaxed line-clamp-4 group-hover:text-primary transition-colors">
                    "{ref.translation_text || ref.reflection_text}"
                  </p>
                </div>

                <div className="mt-auto pt-8 border-t border-neutral-50 flex items-center justify-between relative z-10">
                   <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Read Chapter</span>
                   <ChevronRight size={14} className="text-neutral-200 group-hover:text-primary transition-colors" />
                </div>
              </div>
            )) : (
              <div className="md:col-span-3 py-20 bg-white rounded-premium-card border border-neutral-100/50 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-200 mb-4"><Heart size={32}/></div>
                 <h3 className="text-lg font-bold text-secondary">No My Favorites yet</h3>
                 <p className="text-sm text-neutral-400 mt-2">Favorite a daily nudge to add it to your collection.</p>
              </div>
            )}
          </div>
        </section>


      </main>

      <footer className="mt-auto py-20 border-t border-neutral-100 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-neutral-100 rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-2">
                 <img src={logoOfficial} alt="QConnect Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">QConnect</span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-300">
             The Sacred Breath • 2026
           </p>
           <div className="flex items-center gap-8 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
