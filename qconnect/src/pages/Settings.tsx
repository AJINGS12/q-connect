import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { startQfLogin, getQfAccessToken, clearQfAccessToken } from '../services/qfOAuth';
import { 
  ChevronLeft, User, Bell,
  Trash2, LogOut, Moon, Globe, AlertTriangle, BookMarked, Link, Unlink
} from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qfConnected, setQfConnected] = useState(!!getQfAccessToken());

  const handleConnectQf = () => {
    const redirectUri = `${window.location.origin}/callback`;
    startQfLogin(redirectUri);
  };

  const handleDisconnectQf = () => {
    clearQfAccessToken();
    setQfConnected(false);
  };

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Delete user profile data (RLS/Cascade will handle reflections/progress)
      await supabase.from('user_profiles').delete().eq('id', user.id);
      
      // 2. Sign out (In a real production app, you'd call a Supabase Admin API to delete the Auth user)
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft font-body text-secondary pb-32 transition-all duration-700">
      {/* --- HEADER --- */}
      <nav className="glass-panel sticky top-0 z-50 py-6 px-8 border-none bg-white/70">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 text-neutral-400 hover:text-primary transition-all group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 group-hover:border-primary/30 shadow-sm transition-all">
               <ChevronLeft size={18} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Back to Overview</span>
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Globe size={16} />
             </div>
             <h1 className="font-display text-sm font-bold text-secondary uppercase tracking-widest">Preferences</h1>
          </div>
          <div className="w-24" />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* --- PROFILE SUMMARY --- */}
        <section className="premium-card p-10 flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:scale-110 transition-transform duration-1000"><User size={120} /></div>
          <div className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary text-4xl font-display font-bold uppercase shadow-inner border border-white relative z-10">
            {profile?.role?.charAt(0) || <User />}
          </div>
          <div className="relative z-10 space-y-3">
            <div className="space-y-1">
               <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Profile Status</span>
               <h2 className="text-3xl font-display font-bold text-secondary tracking-tight italic">Current Role: <span className="text-primary capitalize">{profile?.role || 'User'}</span></h2>
            </div>
            <div className="flex gap-4">
              <div className="bg-amber-50/50 border border-amber-100 text-amber-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <span>🪙</span> {profile?.quest_coins || 0} Points
              </div>
              <div className="bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <span>Level</span> {profile?.current_quest_level || 1}
              </div>
            </div>
          </div>
        </section>

        {/* --- SETTINGS GROUPS --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Environmental Settings</span>
          </div>
          <div className="premium-card overflow-hidden p-2">
            {[
              { icon: <Bell size={18}/>, label: "Reminders", detail: "Daily notifications & progress updates" },
              { icon: <Moon size={18}/>, label: "Appearance", detail: "Light theme active" },
              { icon: <Globe size={18}/>, label: "Language", detail: "English (Default)" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-8 hover:bg-neutral-50/50 transition-all rounded-[28px] group text-left">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-secondary group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-xs text-neutral-400 font-light mt-0.5">{item.detail}</p>
                  </div>
                </div>
                <div className="text-neutral-200 group-hover:text-primary transition-all">
                   <ChevronLeft size={16} className="rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- QURAN FOUNDATION ACCOUNT --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Connected Accounts</span>
          </div>
          <div className="premium-card p-10 flex items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:translate-x-4 transition-transform duration-1000"><BookMarked size={100} /></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 shadow-inner ${qfConnected ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105 rotate-3' : 'bg-neutral-50 text-neutral-200 border border-neutral-100'}`}>
                <BookMarked size={28} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg text-secondary tracking-tight">Quran.com Account</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${ qfConnected ? 'text-primary animate-pulse' : 'text-neutral-300'}`}>
                  {qfConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
            
            <div className="relative z-10">
              {qfConnected ? (
                <button
                  onClick={handleDisconnectQf}
                  className="px-6 py-3 rounded-xl border-2 border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                >
                  Disconnect Account
                </button>
              ) : (
                <button
                  id="connect-quran-account-btn"
                  onClick={handleConnectQf}
                  className="px-8 py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 shadow-lg shadow-primary/10"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.4em]">Account Actions</span>
          </div>
          <div className="premium-card overflow-hidden p-2 border-red-50/50">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-8 hover:bg-neutral-50/50 transition-all rounded-[28px] group text-left"
            >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                    <LogOut size={18} />
                 </div>
                 <span className="font-bold text-sm text-secondary">Sign Out</span>
              </div>
              <div className="text-neutral-200 group-hover:text-secondary transition-all">
                 <ChevronLeft size={16} className="rotate-180" />
              </div>
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-8 hover:bg-red-50 transition-all rounded-[28px] group text-left"
            >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-300 group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                    <Trash2 size={18} />
                 </div>
                 <div className="space-y-0.5">
                    <span className="font-bold text-sm text-red-500">Delete Account</span>
                    <p className="text-[10px] font-black text-red-300 uppercase tracking-widest">Permanent</p>
                 </div>
              </div>
              <div className="text-red-100 group-hover:text-red-500 transition-all">
                 <ChevronLeft size={16} className="rotate-180" />
              </div>
            </button>
          </div>
        </div>

        {/* --- DELETE MODAL --- */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white rounded-premium-card p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-red-100/50">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-3xl font-display font-bold text-secondary mb-4 tracking-tight">Are you sure?</h3>
              <p className="text-neutral-400 text-sm mb-10 leading-relaxed font-light">
                This will permanently delete your progress, points, and reflections. This cannot be undone.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full text-neutral-400 py-3 font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;