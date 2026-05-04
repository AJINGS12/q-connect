import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Bell, Plus, Clock, Calendar, 
  Trash2, ToggleLeft, ToggleRight, Sparkles,
  BookOpen, Check, X, Edit3
} from 'lucide-react';

interface Reminder {
  id: string;
  surah_id: number;
  surah_name: string;
  reminder_time: string;
  days: string[];
  reminder_date?: string | null;
  is_active: boolean;
}

const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Form State
  const [surahId, setSurahId] = useState<number>(18); // Default Al-Kahf
  const [surahName, setSurahName] = useState('Al-Kahf');
  const [time, setTime] = useState('10:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Friday']);
  const [reminderType, setReminderType] = useState<'recurring' | 'one-time'>('recurring');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setReminders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      setReminders(reminders.map((r: Reminder) => r.id === id ? { ...r, is_active: !currentStatus } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setReminders(reminders.filter((r: Reminder) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReminder = async () => {
    if (!currentUser) return;

    const payload = {
      user_id: currentUser.id,
      surah_id: surahId,
      surah_name: surahName,
      reminder_time: time,
      days: reminderType === 'recurring' ? selectedDays : [],
      reminder_date: reminderType === 'one-time' ? date : null,
      is_active: true
    };

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('reminders')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setReminders(reminders.map((r: Reminder) => r.id === editingId ? data : r));
      } else {
        const { data, error } = await supabase
          .from('reminders')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setReminders([data, ...reminders]);
      }
      
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    // Reset form
    setSurahId(18);
    setSurahName('Al-Kahf');
    setTime('10:00');
    setSelectedDays(['Friday']);
    setReminderType('recurring');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setSurahId(reminder.surah_id);
    setSurahName(reminder.surah_name);
    setTime(reminder.reminder_time);
    setSelectedDays(reminder.days);
    setReminderType(reminder.reminder_date ? 'one-time' : 'recurring');
    if (reminder.reminder_date) setDate(reminder.reminder_date);
    setIsAdding(true);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="w-10 h-10 border-[3px] border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-body pb-20">
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/home")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-[#00695C]/30 text-[#00695C] shadow-sm transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Settings</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">My Reminders</h1>
            </div>
          </div>
          <button 
            onClick={() => {
              closeModal();
              setIsAdding(true);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#00695C] text-white shadow-lg shadow-[#00695C]/20 active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8 space-y-8">
        
        {/* Notification Permission Banner */}
        {notificationPermission === 'default' && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[32px] flex items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bell size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-blue-900">Enable Phone Notifications</h4>
                <p className="text-xs text-blue-800/70 font-medium">Get a banner on your phone when it's time to recite.</p>
              </div>
            </div>
            <button 
              onClick={requestPermission}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20"
            >
              Enable
            </button>
          </div>
        )}

        {/* Special Friday Card */}
        {!reminders.some((r: Reminder) => r.surah_id === 18 && r.days.includes('Friday')) && (
          <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-[32px] p-8 text-white shadow-xl shadow-[#00695C]/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Friday Sunnah</span>
              <h2 className="text-2xl font-display font-black mt-2 mb-4">Surah Al-Kahf Reminder</h2>
              <p className="text-teal-50/80 text-sm mb-8 max-w-xs leading-relaxed">
                Never miss the Friday blessing. Set a recurring reminder to recite Surah Al-Kahf every Friday.
              </p>
              <button 
                onClick={() => {
                  setSurahId(18);
                  setSurahName('Al-Kahf');
                  setSelectedDays(['Friday']);
                  setTime('09:00');
                  setIsAdding(true);
                }}
                className="bg-white text-[#00695C] px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
              >
                Set Reminder
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] px-2">Active Reminders</h3>
          <div className="grid gap-4">
            {reminders.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[32px] border border-neutral-100 border-dashed">
                <Bell size={40} className="mx-auto text-neutral-200 mb-4" />
                <p className="text-neutral-400 font-medium text-sm">No reminders set yet.<br/>Tap the + button to start.</p>
              </div>
            ) : (
              reminders.map((reminder: Reminder) => (
                <div key={reminder.id} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${reminder.is_active ? 'bg-[#00695C]/10 text-[#00695C]' : 'bg-neutral-50 text-neutral-300'}`}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-display font-black transition-colors ${reminder.is_active ? 'text-neutral-800' : 'text-neutral-400'}`}>
                        {reminder.surah_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold">
                          <Clock size={12} /> {reminder.reminder_time}
                        </div>
                        <span className="text-neutral-200 text-[10px]">•</span>
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold">
                          <Calendar size={12} /> 
                          {reminder.reminder_date 
                            ? new Date(reminder.reminder_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : reminder.days.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditClick(reminder)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-300 hover:text-[#00695C] hover:bg-[#00695C]/5 transition-all opacity-0 group-hover:opacity-100"
                      title="Edit Reminder"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${reminder.is_active ? 'text-[#00695C] hover:bg-[#00695C]/5' : 'text-neutral-300 hover:bg-neutral-50'}`}
                    >
                      {reminder.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                    <button 
                      onClick={() => deleteReminder(reminder.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Reminder Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-black text-neutral-800">
                {editingId ? 'Edit Reminder' : 'New Reminder'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-3">Surah to Recite</label>
                <div className="relative">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00695C]" size={20} />
                  <select 
                    value={surahId}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setSurahId(id);
                      // In a real app we'd fetch names, here we just set Al-Kahf or other
                      setSurahName(id === 18 ? 'Al-Kahf' : id === 67 ? 'Al-Mulk' : 'Surah ' + id);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-100 py-4 pl-14 pr-6 rounded-2xl appearance-none font-bold text-neutral-800 focus:outline-none focus:ring-4 focus:ring-[#00695C]/5 focus:bg-white transition-all"
                  >
                    <option value={18}>Surah Al-Kahf</option>
                    <option value={67}>Surah Al-Mulk</option>
                    <option value={36}>Surah Yasin</option>
                    <option value={55}>Surah Ar-Rahman</option>
                    <option value={56}>Surah Al-Waqi'ah</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 p-1.5 bg-neutral-100 rounded-2xl">
                <button 
                  onClick={() => setReminderType('recurring')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reminderType === 'recurring' ? 'bg-white text-primary shadow-sm' : 'text-neutral-400'}`}
                >
                  Recurring
                </button>
                <button 
                  onClick={() => setReminderType('one-time')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reminderType === 'one-time' ? 'bg-white text-primary shadow-sm' : 'text-neutral-400'}`}
                >
                  One-time
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-3">Time</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00695C]" size={20} />
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-100 py-4 pl-14 pr-6 rounded-2xl font-bold text-neutral-800 focus:outline-none focus:ring-4 focus:ring-[#00695C]/5 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {reminderType === 'recurring' ? (
                <div>
                  <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-3">Repeat on Days</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedDays.includes(day) 
                            ? 'bg-[#00695C] text-white shadow-md' 
                            : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-[#00695C] uppercase tracking-[0.2em] mb-3">Pick Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00695C]" size={20} />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-neutral-50 border border-neutral-100 py-4 pl-14 pr-6 rounded-2xl font-bold text-neutral-800 focus:outline-none focus:ring-4 focus:ring-[#00695C]/5 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveReminder}
                disabled={!surahName || !time || (reminderType === 'recurring' && selectedDays.length === 0) || (reminderType === 'one-time' && !date)}
                className="w-full py-4 rounded-2xl bg-[#00695C] text-white font-bold tracking-wide shadow-xl shadow-[#00695C]/20 hover:bg-[#004D40] transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <Check size={20} /> {editingId ? 'Save Changes' : 'Create Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
