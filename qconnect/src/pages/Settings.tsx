import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, User, Bell, Shield, 
  Trash2, LogOut, Moon, Globe, AlertTriangle 
} from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div className="min-h-screen bg-[#FBFBFA] font-body text-secondary pb-12">
      {/* --- HEADER --- */}
      <nav className="bg-white border-b border-neutral-100 px-6 py-6 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-neutral-50 rounded-xl transition-all">
            <ChevronLeft size={24} className="text-neutral-400" />
          </button>
          <h1 className="text-xl font-display font-bold text-[#00695C]">App Settings</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-8">
        
        {/* --- PROFILE SUMMARY --- */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100 flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-[#00695C]/10 flex items-center justify-center text-[#00695C] text-3xl font-bold uppercase">
            {profile?.role?.charAt(0) || <User />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary uppercase tracking-tight">Active Session</h2>
            <p className="text-neutral-400 text-sm">Role: <span className="capitalize">{profile?.role || 'User'}</span></p>
            <div className="flex gap-2 mt-2">
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">🪙 {profile?.quest_coins || 0} Coins</span>
              <span className="bg-teal-50 text-[#00695C] px-3 py-1 rounded-lg text-[10px] font-black uppercase">Level {profile?.current_quest_level || 1}</span>
            </div>
          </div>
        </section>

        {/* --- SETTINGS GROUPS --- */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-4">Preferences</span>
          <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-neutral-100">
            {[
              { icon: <Bell size={20}/>, label: "Notifications", detail: "Daily nudges & quest reminders" },
              { icon: <Moon size={20}/>, label: "Appearance", detail: "Light mode active" },
              { icon: <Globe size={20}/>, detail: "English (Default)", label: "Language" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-all border-b border-neutral-50 last:border-0 text-left">
                <div className="flex items-center gap-4">
                  <div className="text-neutral-400">{item.icon}</div>
                  <div>
                    <p className="font-bold text-sm text-secondary">{item.label}</p>
                    <p className="text-xs text-neutral-400">{item.detail}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div className="space-y-3 pt-4">
          <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] ml-4">Danger Zone</span>
          <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-neutral-100">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-6 hover:bg-neutral-50 transition-all border-b border-neutral-50 text-neutral-600"
            >
              <LogOut size={20} />
              <span className="font-bold text-sm">Sign Out</span>
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-4 p-6 hover:bg-red-50 transition-all text-red-500"
            >
              <Trash2 size={20} />
              <span className="font-bold text-sm">Delete Account & Data</span>
            </button>
          </div>
        </div>

        {/* --- DELETE MODAL --- */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary mb-4">Are you sure?</h3>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                This will permanently delete your quest progress, coins, and reflections. This action cannot be undone.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  Yes, Delete Everything
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-neutral-100 text-neutral-500 py-4 rounded-2xl font-bold active:scale-95 transition-all"
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