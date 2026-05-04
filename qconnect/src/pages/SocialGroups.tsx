import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Plus, KeyRound, CheckCircle2, Moon, BookOpen, Settings2, Trash2, LogOut, Info, Edit3, ShieldCheck, X, Share2 } from 'lucide-react';

const SocialGroups: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_groups' | 'create' | 'join'>('my_groups');
  
  // Data
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memberInactivity, setMemberInactivity] = useState<Record<string, number>>({});

  // Forms
  const [createName, setCreateName] = useState('');
  const [createRules, setCreateRules] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing logic
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupRules, setEditGroupRules] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetchMyGroups();
    
    // Check for deep-link join code
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) {
      setJoinCode(code.toUpperCase());
      setActiveTab('join');
      // Clear the param from URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchMyGroups = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      // Fetch memberships
      const { data: memberships } = await supabase
        .from('halaqah_members')
        .select('group_id, status_signal, last_updated, role')
        .eq('user_id', user.id);

      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map(m => m.group_id);
        const { data: groups } = await supabase
          .from('halaqah_groups')
          .select('*')
          .in('id', groupIds);
        
        if (groups) {
          // Merge
          const merged = groups.map(g => ({
            ...g,
            my_membership: memberships.find(m => m.group_id === g.id)
          }));
          setMyGroups(merged);
        }
      } else {
        setMyGroups([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (group: any) => {
    setSelectedGroup(group);
    try {
      const { data: members } = await supabase
        .from('halaqah_members')
        .select('*')
        .eq('group_id', group.id);

      if (members && members.length > 0) {
        const userIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', userIds);

        const mergedMembers = members.map(m => ({
          ...m,
          display_name: profiles?.find(p => p.id === m.user_id)?.display_name || 'Anonymous Reader'
        }));
        
        // Sort: current user first, then admins, then others
        mergedMembers.sort((a, b) => {
           if (a.user_id === currentUser?.id) return -1;
           if (b.user_id === currentUser?.id) return 1;
           if (a.role === 'admin' && b.role !== 'admin') return -1;
           if (b.role === 'admin' && a.role !== 'admin') return 1;
           return 0;
        });

        setGroupMembers(mergedMembers);

        // Fetch inactivity data via RPC
        try {
          const { data: inactivityData } = await supabase.rpc('get_group_last_read', { p_group_id: group.id });
          if (inactivityData) {
            const inactivityMap: Record<string, number> = {};
            inactivityData.forEach((row: any) => {
              if (row.last_read_at) {
                const diffMs = Date.now() - new Date(row.last_read_at).getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                inactivityMap[row.user_id] = diffDays;
              } else {
                inactivityMap[row.user_id] = 999; // never read
              }
            });
            setMemberInactivity(inactivityMap);
          }
        } catch (rpcErr) {
          console.warn('Inactivity RPC failed:', rpcErr);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async () => {
    setErrorMsg('');
    if (!createName.trim()) {
      setErrorMsg('Group name is required');
      return;
    }
    
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newGroup, error: groupError } = await supabase
        .from('halaqah_groups')
        .insert({
          invite_code: code,
          name: createName.trim(),
          rules: createRules.trim(),
          admin_id: currentUser.id
        }).select().single();

      if (groupError) throw groupError;

      if (newGroup) {
        await supabase.from('halaqah_members').insert({
          group_id: newGroup.id,
          user_id: currentUser.id,
          status_signal: 'ready',
          role: 'admin' // Creator is the first admin
        });
        
        setCreateName('');
        setCreateRules('');
        setActiveTab('my_groups');
        await fetchMyGroups();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async () => {
    setErrorMsg('');
    if (!joinCode.trim()) {
      setErrorMsg('Invite code is required');
      return;
    }

    try {
      const { data: group, error: findError } = await supabase
        .from('halaqah_groups')
        .select('*')
        .eq('invite_code', joinCode.trim().toUpperCase())
        .single();

      if (findError || !group) throw new Error('Group not found with that code');

      const { error: joinError } = await supabase.from('halaqah_members').insert({
        group_id: group.id,
        user_id: currentUser.id,
        status_signal: 'ready',
        role: 'member'
      });

      if (joinError) throw joinError;

      setJoinCode('');
      setActiveTab('my_groups');
      await fetchMyGroups();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to join group');
    }
  };

  const updateMySignal = async (signal: string) => {
    if (!selectedGroup) return;
    try {
      await supabase
        .from('halaqah_members')
        .update({ status_signal: signal, last_updated: new Date().toISOString() })
        .eq('group_id', selectedGroup.id)
        .eq('user_id', currentUser.id);
      
      // Refresh details
      await loadGroupDetails(selectedGroup);
    } catch(e) {
      console.error(e);
    }
  };

  const handleEditGroup = async () => {
     if (!selectedGroup) return;
     setIsSavingEdit(true);
     try {
       await supabase.from('halaqah_groups').update({
          name: editGroupName,
          rules: editGroupRules
       }).eq('id', selectedGroup.id);
       
       setIsEditingGroup(false);
       await fetchMyGroups();
       // Reload selected group locally
       setSelectedGroup({ ...selectedGroup, name: editGroupName, rules: editGroupRules });
     } catch (e) {
       console.error(e);
     } finally {
       setIsSavingEdit(false);
     }
  };

  const handleToggleRole = async (memberId: string, currentRole: string) => {
     if (!selectedGroup) return;
     const newRole = currentRole === 'admin' ? 'member' : 'admin';
     try {
        await supabase.from('halaqah_members').update({ role: newRole }).eq('id', memberId);
        await loadGroupDetails(selectedGroup);
     } catch (e) {
        console.error(e);
     }
  };

  const currentUserRole = groupMembers.find(m => m.user_id === currentUser?.id)?.role || 'member';
  const isAdmin = currentUserRole === 'admin';

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    const isConfirm = window.confirm(isAdmin ? "Are you sure you want to delete this group for everyone?" : "Are you sure you want to leave this group?");
    if (!isConfirm) return;

    try {
      if (isAdmin) {
         await supabase.from('halaqah_groups').delete().eq('id', selectedGroup.id);
      } else {
         await supabase.from('halaqah_members').delete().eq('group_id', selectedGroup.id).eq('user_id', currentUser.id);
      }
      setSelectedGroup(null);
      await fetchMyGroups();
    } catch(e) {
       console.error(e);
    }
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Not yet today";
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if it's from a previous day
    const isToday = date.toDateString() === now.toDateString();
    if (!isToday) return "Yesterday";

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  };

  const getSignalInfo = (signal: string) => {
    switch(signal) {
      case 'completed': return { emoji: '🤲', text: 'Alhamdulillah', color: 'text-teal-600', bg: 'bg-teal-50' };
      case 'behind': return { emoji: '😤', text: 'Had Challenges', color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'ready': 
      default: return { emoji: '📖', text: 'Not yet today', color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="w-10 h-10 border-[3px] border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-body relative overflow-x-hidden selection:bg-[#00695C]/20 text-neutral-800 pb-24">
      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button 
            onClick={() => selectedGroup ? setSelectedGroup(null) : navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-[#00695C]/30 text-[#00695C] shadow-sm transition-all active:scale-95 shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col justify-center">
            <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Social Cycle</h1>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 md:pt-4 space-y-6 md:space-y-8">
        
        {/* HEADER */}
        {!selectedGroup && (
          <div className="space-y-4">
             <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-neutral-800">
                Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00695C] to-[#004D40]">Recitation</span>
             </h1>
             <p className="text-neutral-500 font-medium max-w-md">
                Join focused groups to read the Quran together. No chat, no noiseâ€”just pure spiritual accountability.
             </p>

             <div className="flex gap-2 p-1.5 bg-neutral-100 rounded-2xl mt-8 max-w-sm">
                <button 
                  onClick={() => setActiveTab('my_groups')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my_groups' ? 'bg-white text-secondary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  My Groups
                </button>
                <button 
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'join' ? 'bg-white text-secondary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  Join
                </button>
                <button 
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-white text-secondary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  Create
                </button>
             </div>
          </div>
        )}

        {/* ERROR MSG */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium animate-in fade-in">
             {errorMsg}
          </div>
        )}

        {/* MY GROUPS VIEW */}
        {!selectedGroup && activeTab === 'my_groups' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in slide-in-from-bottom-4 duration-500">
              {myGroups.length === 0 ? (
                 <div className="col-span-full py-16 text-center text-neutral-400 font-medium bg-neutral-50 rounded-[32px] border border-neutral-100 border-dashed">
                    You haven't joined any groups yet.<br/>Create one or join using an invite code!
                 </div>
              ) : (
                 myGroups.map(group => (
                    <button 
                      key={group.id}
                      onClick={() => loadGroupDetails(group)}
                      className="text-left p-6 bg-white border border-neutral-100 hover:border-[#00695C]/30 rounded-[32px] shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00695C]/5 to-transparent rounded-bl-full" />
                       <h3 className="text-xl font-display font-black text-secondary mb-1">{group.name}</h3>
                       <p className="text-xs text-neutral-400 font-medium mb-6 uppercase tracking-widest flex items-center gap-1"><Users size={12}/> Group Code: {group.invite_code}</p>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#00695C] group-hover:translate-x-1 transition-transform">View Dashboard â†’</span>
                       </div>
                    </button>
                 ))
              )}
           </div>
        )}

        {/* JOIN GROUP VIEW */}
        {!selectedGroup && activeTab === 'join' && (
           <div className="max-w-md mt-6 animate-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100">
              <div className="w-16 h-16 bg-[#00695C]/10 rounded-full flex items-center justify-center text-[#00695C] mb-6">
                 <KeyRound size={28} />
              </div>
              <h3 className="text-2xl font-display font-black text-secondary mb-2">Join a Group</h3>
              <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                 Enter the 6-character invite code shared by the group admin to join their reading circle.
              </p>
              <input 
                type="text" 
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="e.g. AX79B"
                className="w-full bg-neutral-50 border border-neutral-100 py-4 px-6 rounded-2xl mb-6 focus:bg-white focus:border-[#00695C]/30 focus:ring-4 focus:ring-[#00695C]/5 font-black text-center tracking-widest text-secondary outline-none transition-all uppercase"
                maxLength={6}
              />
              <button 
                onClick={handleJoinGroup}
                className="w-full py-4 rounded-2xl bg-[#00695C] text-white font-bold tracking-wide shadow-xl shadow-[#00695C]/20 hover:bg-[#004D40] transition-colors"
              >
                 Join Group
              </button>
           </div>
        )}

        {/* CREATE GROUP VIEW */}
        {!selectedGroup && activeTab === 'create' && (
           <div className="max-w-md mt-6 animate-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100">
              <div className="w-16 h-16 bg-[#00695C]/10 rounded-full flex items-center justify-center text-[#00695C] mb-6">
                 <Plus size={28} />
              </div>
              <h3 className="text-2xl font-display font-black text-secondary mb-2">Create a Group</h3>
              <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                 Start a new recitation group. You'll get an invite code to share with your friends or family.
              </p>
              
              <div className="space-y-5 mb-8">
                 <div>
                    <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-2">Group Name</label>
                    <input 
                      type="text" 
                      value={createName}
                      onChange={e => setCreateName(e.target.value)}
                      placeholder="e.g. Family Ramadhan Read"
                      className="w-full bg-neutral-50 border border-neutral-200/60 py-4 px-5 rounded-2xl focus:bg-white focus:border-[#00695C]/30 focus:ring-4 focus:ring-[#00695C]/5 text-neutral-800 text-lg font-bold outline-none transition-all placeholder:text-neutral-300 placeholder:font-normal"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Guidelines / Goal (Optional)</label>
                    <textarea 
                      value={createRules}
                      onChange={e => setCreateRules(e.target.value)}
                      placeholder="e.g. Read 10 ayahs a day from Surah Al-Baqarah."
                      className="w-full bg-neutral-50 border border-neutral-200/60 py-4 px-5 rounded-2xl focus:bg-white focus:border-[#00695C]/30 focus:ring-4 focus:ring-[#00695C]/5 text-neutral-800 font-medium outline-none transition-all resize-none h-28 placeholder:text-neutral-300"
                    />
                 </div>
              </div>

              <button 
                onClick={handleCreateGroup}
                className="w-full py-4 rounded-2xl bg-[#00695C] text-white font-bold tracking-wide shadow-xl shadow-[#00695C]/20 hover:bg-[#004D40] transition-colors"
              >
                 Create & Join
              </button>
           </div>
        )}

        {/* SPECIFIC GROUP DASHBOARD */}
        {selectedGroup && (
           <div className="animate-in fade-in duration-500 space-y-8">
              {/* Maghrib Nudge */}
              {(() => {
                const now = new Date();
                const hours = now.getHours();
                const myStatus = groupMembers.find(m => m.user_id === currentUser?.id)?.status_signal;
                
                // Show nudge if after 5 PM and user is still 'ready' (hasn't reacted)
                if (hours >= 17 && myStatus === 'ready') {
                  return (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-900 animate-bounce shadow-sm">
                      <div className="text-2xl">🌅</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-0.5">Evening Reminder</p>
                        <p className="text-sm font-medium">Don't forget to log today's recitation 📖</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Group Header Card */}
              <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-[#00695C]/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                 <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
                           <Users size={14} /> Social Cycle
                        </div>
                       
                       <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">{selectedGroup.name}</h2>
                          {isAdmin && (
                            <button 
                              onClick={() => {
                                setEditGroupName(selectedGroup.name);
                                setEditGroupRules(selectedGroup.rules || '');
                                setIsEditingGroup(true);
                              }}
                              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                               <Edit3 size={18} />
                            </button>
                          )}
                       </div>
                       
                       <div className="max-w-md">
                          <p className="text-teal-100 text-sm leading-relaxed mb-1 font-bold">Guidelines:</p>
                          <p className="text-white/80 text-sm leading-relaxed">{selectedGroup.rules || 'No specific rules set for this group.'}</p>
                       </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl text-center min-w-[140px]">
                       <p className="text-[10px] text-teal-100 uppercase font-black tracking-widest mb-1">Invite Code</p>
                       <div className="flex items-center justify-center gap-3">
                          <p className="text-2xl font-mono font-bold tracking-widest">{selectedGroup.invite_code}</p>
                          <button 
                            onClick={() => {
                              const joinUrl = `${window.location.origin}/social?join=${selectedGroup.invite_code}`;
                              const shareText = `Join my Quran Reading Circle on QConnect! Use this link or invite code: ${selectedGroup.invite_code}`;
                              
                              if (navigator.share) {
                                navigator.share({
                                  title: 'Join my Social Cycle',
                                  text: shareText,
                                  url: joinUrl
                                }).catch(() => {
                                  navigator.clipboard.writeText(joinUrl);
                                });
                              } else {
                                navigator.clipboard.writeText(joinUrl);
                                alert('Invite link copied to clipboard!');
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all active:scale-90"
                            title="Share Invite"
                          >
                             <Share2 size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Group Progress Bar */}
              <div className="bg-white/60 backdrop-blur-md border border-neutral-100 p-6 rounded-[32px] shadow-sm">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Today's Group Progress</h4>
                    <span className="text-xs font-bold text-primary">
                       {groupMembers.filter(m => m.status_signal === 'completed').length} of {groupMembers.length} recited
                    </span>
                 </div>
                 <div className="w-full h-3 bg-neutral-200/50 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-1000"
                       style={{ width: `${(groupMembers.filter(m => m.status_signal === 'completed').length / groupMembers.length) * 100}%` }}
                    />
                 </div>
              </div>

              {/* Status Picker for Current User */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="text-center md:text-left">
                    <h3 className="text-lg font-display font-black text-secondary">Your Status</h3>
                    <p className="text-xs text-neutral-500 font-medium">How is your recitation going today?</p>
                 </div>
                 <div className="flex gap-4">
                    {[
                       { id: 'completed', emoji: '🤲' },
                       { id: 'behind', emoji: '😤' },
                       { id: 'ready', emoji: '📖' }
                    ].map(btn => (
                       <button 
                         key={btn.id}
                         onClick={() => updateMySignal(btn.id)}
                         className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 shadow-sm border ${
                            groupMembers.find(m => m.user_id === currentUser?.id)?.status_signal === btn.id
                            ? 'bg-primary border-primary text-white shadow-primary/20 ring-4 ring-primary/10'
                            : 'bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-white hover:border-primary/30'
                         }`}
                       >
                          {btn.emoji}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                 <h3 className="text-lg font-display font-black text-secondary px-2 flex items-center gap-2">
                    Live Board
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 </h3>
                 <div className="grid gap-3">
                    {groupMembers.map(member => {
                       const status = getSignalInfo(member.status_signal);
                       const lastUpdatedDate = member.last_updated ? new Date(member.last_updated) : null;
                       const isFresh = lastUpdatedDate && (Date.now() - lastUpdatedDate.getTime() < 30 * 60000);
                       
                       return (
                        <div 
                          key={member.id} 
                          className={`flex items-center justify-between p-5 bg-white border rounded-[32px] transition-all duration-500 ${
                            isFresh ? 'border-primary/30 shadow-lg shadow-primary/5 bg-primary/[0.02]' : 'border-neutral-100 shadow-sm'
                          }`}
                        >
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center font-black text-neutral-400 uppercase border border-neutral-200/50 overflow-hidden">
                                   {member.display_name.substring(0, 2)}
                                </div>
                                {isFresh && (
                                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                   </div>
                                )}
                              </div>
                              <div>
                                 <p className="font-black text-secondary text-sm flex items-center gap-2">
                                   {member.display_name}
                                   {member.role === 'admin' && <ShieldCheck size={14} className="text-primary" />}
                                   {member.user_id === currentUser.id && <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase ml-1">You</span>}
                                 </p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs">{status.emoji}</span>
                                    <span className={`text-[11px] font-bold ${status.color}`}>{status.text}</span>
                                    <span className="text-neutral-300">•</span>
                                    <span className="text-[10px] text-neutral-400 font-medium">{formatRelativeTime(member.last_updated)}</span>
                                 </div>
                               </div>
                           </div>
                           
                           {isAdmin && member.user_id !== currentUser.id && (
                              <button 
                                onClick={() => handleToggleRole(member.id, member.role)}
                                className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-primary/5 text-neutral-400 hover:text-primary flex items-center justify-center transition-all active:scale-95"
                                title={member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              >
                                 <Settings2 size={16} />
                              </button>
                           )}
                        </div>
                       );
                    })}
                 </div>
                 
                 <div className="pt-8 flex justify-center">
                    <button onClick={handleDeleteGroup} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-red-500 hover:bg-red-50 text-xs font-bold transition-colors uppercase tracking-widest">
                       {isAdmin ? <><Trash2 size={16} /> Delete Group</> : <><LogOut size={16} /> Leave Group</>}
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* EDIT GROUP MODAL */}
        {isEditingGroup && selectedGroup && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsEditingGroup(false)} />
              <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/50">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-display font-black text-secondary">Edit Circle</h3>
                    <button onClick={() => setIsEditingGroup(false)} className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400"><X size={20}/></button>
                 </div>
                 
                 <div className="space-y-5 mb-8">
                    <div>
                       <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-2">Group Name</label>
                       <input 
                         type="text" 
                         value={editGroupName}
                         onChange={e => setEditGroupName(e.target.value)}
                         className="w-full bg-neutral-50 border border-neutral-200/60 py-4 px-5 rounded-2xl focus:bg-white focus:border-[#00695C]/30 focus:ring-4 focus:ring-[#00695C]/5 text-neutral-800 text-lg font-bold outline-none transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Guidelines / Goal</label>
                       <textarea 
                         value={editGroupRules}
                         onChange={e => setEditGroupRules(e.target.value)}
                         className="w-full bg-neutral-50 border border-neutral-200/60 py-4 px-5 rounded-2xl focus:bg-white focus:border-[#00695C]/30 focus:ring-4 focus:ring-[#00695C]/5 text-neutral-800 font-medium outline-none transition-all resize-none h-28"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleEditGroup}
                   disabled={isSavingEdit || !editGroupName.trim()}
                   className="w-full py-4 rounded-2xl bg-[#00695C] text-white font-bold tracking-wide shadow-xl shadow-[#00695C]/20 hover:bg-[#004D40] transition-colors disabled:opacity-50"
                 >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default SocialGroups;

