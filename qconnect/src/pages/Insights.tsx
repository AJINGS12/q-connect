import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getSpiritualEngagementScore } from '../services/scoringEngine';
import { type UserActivity, type EngagementMetrics } from '../types/activity';
import { Award, TrendingUp, Sparkles, Activity, Clock, ShieldCheck, ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RadarChart = ({ metrics }: { metrics: EngagementMetrics | null }) => {
  if (!metrics) return null;
  
  const data = [
    { label: 'Consistency', value: metrics.consistencyScore / 100 },
    { label: 'Quality', value: metrics.engagementQualityScore / 100 },
    { label: 'Memorization', value: metrics.memorizationScore / 100 },
    { label: 'Reflection', value: metrics.reflectionScore / 100 },
  ];

  const size = 200;
  const center = size / 2;
  const maxRadius = center - 20;

  const dataPoints = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    const r = d.value * maxRadius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  const createGridPolygon = (scale: number) => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const r = scale * maxRadius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  };

  return (
    <div className="relative w-full max-w-[280px] aspect-square mx-auto drop-shadow-2xl">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <polygon points={createGridPolygon(1)} fill="none" stroke="#00695C" strokeWidth="0.5" strokeOpacity="0.2" />
        <polygon points={createGridPolygon(0.75)} fill="none" stroke="#00695C" strokeWidth="0.5" strokeOpacity="0.2" />
        <polygon points={createGridPolygon(0.5)} fill="none" stroke="#00695C" strokeWidth="0.5" strokeOpacity="0.2" />
        <polygon points={createGridPolygon(0.25)} fill="none" stroke="#00695C" strokeWidth="0.5" strokeOpacity="0.2" />
        
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          return (
            <line 
              key={`axis-${i}`}
              x1={center} y1={center} 
              x2={center + maxRadius * Math.cos(angle)} y2={center + maxRadius * Math.sin(angle)} 
              stroke="#00695C" strokeWidth="0.5" strokeOpacity="0.2" 
            />
          );
        })}

        <polygon 
          points={dataPoints} 
          fill="rgba(0, 105, 92, 0.4)" 
          stroke="#00695C" 
          strokeWidth="2" 
          className="transition-all duration-1000 ease-out"
        />
        
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          const r = d.value * maxRadius;
          return (
             <circle 
               key={`point-${i}`}
               cx={center + r * Math.cos(angle)} 
               cy={center + r * Math.sin(angle)} 
               r="3" 
               fill="#AEEA00" 
               stroke="#004D40" 
               strokeWidth="1.5" 
             />
          );
        })}

        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          const labelR = maxRadius + 15;
          return (
            <text 
              key={`label-${i}`}
              x={center + labelR * Math.cos(angle)} 
              y={center + labelR * Math.sin(angle)} 
              textAnchor="middle" 
              alignmentBaseline="middle" 
              className="text-[8px] font-bold fill-neutral-600 uppercase tracking-widest"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [percentileEstimate, setPercentileEstimate] = useState<number>(0);
  const [totalVersesRead, setTotalVersesRead] = useState(0);
  const [daysAway, setDaysAway] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: events, error } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', session.user.id)
          .order('timestamp_start', { ascending: false });
          
        if (error) throw error;
        
        const typedEvents = (events || []) as UserActivity[];
        
        if (typedEvents.length > 0) {
           const lastActivityDate = new Date(typedEvents[0].timestamp_start);
           const now = new Date();
           const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
           const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
           setDaysAway(diffDays);
        }
        
        const uniqueDays = new Set(typedEvents.map(e => new Date(e.timestamp_start).toDateString())).size;
        const currentStreak = Math.max(1, uniqueDays);
        const active30 = Math.max(uniqueDays, 3);

        const calculatedMetrics = getSpiritualEngagementScore(active30, currentStreak, typedEvents);
        
        const percentile = Math.min(99, Math.max(1, Math.round((calculatedMetrics.compositeSES / 1000) * 100)));
        
        setMetrics(calculatedMetrics);
        setPercentileEstimate(percentile);
        setTotalVersesRead(new Set(typedEvents.map(e => `${e.surah_number}:${e.ayah_number}`)).size);

      } catch (err) {
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-10 h-10 border-[3px] border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-body relative overflow-x-hidden selection:bg-[#00695C]/20 text-neutral-800 pb-24">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply opacity-[0.08] blur-[100px]" style={{ background: 'radial-gradient(circle, #00695C 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply opacity-[0.05] blur-[120px]" style={{ background: 'radial-gradient(circle, #AEEA00 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#00695C 1px, transparent 1px), linear-gradient(90deg, #00695C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-[#00695C]/30 text-[#00695C] shadow-sm transition-all active:scale-95 shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Activity</p>
            <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Spiritual Insights</h1>
          </div>
        </div>
      </nav>

      {metrics && (
        <main className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-8 md:space-y-12">
           
           {/* HEADER */}
           <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-neutral-800">
                 Spiritual <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00695C] to-[#004D40]">Insights</span>
              </h1>
              <p className="max-w-md mx-auto text-neutral-500 font-medium">
                 Your private, holistic reading behaviors analyzed to guide your consistency and mindfulness.
              </p>
           </div>

           {/* MAIN DASHBOARD GRID */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: PERCENTILE & HERO SCORE */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                 
                 {/* WELCOME BACK UX (Conditional) */}
                 {daysAway > 7 ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 text-center shadow-lg shadow-amber-900/5 relative overflow-hidden animate-in zoom-in-95 duration-500">
                       <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-300 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                          <Heart size={28} />
                       </div>
                       <h3 className="text-2xl font-display font-black text-amber-900 mb-2">Welcome Back</h3>
                       <p className="text-amber-800/80 text-sm font-medium leading-relaxed">
                          It's been a little while, but every return is a beautiful new beginning. We're so glad you're here to reconnect with the Quran today.
                       </p>
                    </div>
                 ) : (
                    <div className="bg-teal-50 border border-teal-100 rounded-[32px] p-8 text-center shadow-lg shadow-teal-900/5 relative overflow-hidden">
                       <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-emerald-300 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                          <TrendingUp size={28} />
                       </div>
                       <h3 className="text-2xl font-display font-black text-teal-900 mb-2">Habit Going Strong</h3>
                       <p className="text-teal-800/80 text-sm font-medium leading-relaxed">
                          Your consistency is inspiring. Keep up the excellent work and continue nurturing your connection with the Quran!
                       </p>
                    </div>
                 )}

                 {/* SES SCORE CARD */}
                 <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#00695C]/20 border border-white/10 group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-6 opacity-80">
                         <Sparkles size={16} />
                         <span className="text-[10px] uppercase font-black tracking-widest">Composite SES</span>
                       </div>
                       
                       <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-5xl md:text-7xl font-display font-black tracking-tighter">{Math.round(metrics.compositeSES)}</span>
                          <span className="text-xl font-bold opacity-50">/1000</span>
                       </div>
                       
                       <p className="text-sm font-medium text-teal-100 leading-relaxed mb-6">
                         Your engagement metrics are growing strong. Keep building the habit.
                       </p>

                       <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#AEEA00] to-[#76FF03] rounded-full transition-all duration-1000" 
                            style={{ width: `${(metrics.compositeSES / 1000) * 100}%` }} 
                          />
                       </div>
                    </div>
                 </div>

                 {/* GLOBAL PERCENTILE CARD */}
                 <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative">
                    <h3 className="text-neutral-400 text-[10px] uppercase font-black tracking-widest mb-4">Anonymized Rank</h3>
                    <div className="flex items-center justify-center gap-4 mb-4">
                       <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#AEEA00] to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-[#AEEA00]/30 transform -rotate-12">
                          <Award size={32} />
                       </div>
                       <div className="text-left">
                          <span className="text-4xl font-display font-black text-neutral-800 tracking-tight">Top {100 - percentileEstimate}%</span>
                       </div>
                    </div>
                    <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                       You are engaging more mindfully than <strong className="text-[#00695C]">{percentileEstimate}%</strong> of readers in our models.
                    </p>
                 </div>
              </div>

              {/* RIGHT: RADAR & BREAKDOWN */}
              <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                 <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                    
                    {/* RADAR CHART COMPONENT */}
                    <div className="flex-1 w-full relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#00695C] opacity-[0.03] blur-2xl rounded-full" />
                        <RadarChart metrics={metrics} />
                    </div>

                    {/* STATS LIST */}
                    <div className="flex-1 w-full space-y-6">
                       
                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                             <div className="flexItems-center gap-2">
                               <Clock size={14} className="text-[#00695C] inline-block mr-1.5 mb-0.5" />
                               <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Consistency</span>
                             </div>
                             <span className="text-sm font-black text-[#00695C]">{Math.round(metrics.consistencyScore)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#00695C] rounded-full" style={{ width: `${metrics.consistencyScore}%` }} />
                          </div>
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                             <div className="flexItems-center gap-2">
                               <Activity size={14} className="text-[#00695C] inline-block mr-1.5 mb-0.5" />
                               <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Quality</span>
                             </div>
                             <span className="text-sm font-black text-[#00695C]">{Math.round(metrics.engagementQualityScore)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#00695C] rounded-full" style={{ width: `${metrics.engagementQualityScore}%` }} />
                          </div>
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                             <div className="flexItems-center gap-2">
                               <ShieldCheck size={14} className="text-[#AEEA00] inline-block mr-1.5 mb-0.5" />
                               <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Memorization</span>
                             </div>
                             <span className="text-sm font-black text-[#8fc200]">{Math.round(metrics.memorizationScore)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#AEEA00] rounded-full" style={{ width: `${metrics.memorizationScore}%` }} />
                          </div>
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                             <div className="flexItems-center gap-2">
                               <TrendingUp size={14} className="text-[#00695C] inline-block mr-1.5 mb-0.5" />
                               <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Reflection</span>
                             </div>
                             <span className="text-sm font-black text-[#00695C]">{Math.round(metrics.reflectionScore)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#00695C] rounded-full" style={{ width: `${metrics.reflectionScore}%` }} />
                          </div>
                       </div>

                       <div className="pt-4 mt-4 border-t border-neutral-100">
                          <p className="text-xs text-neutral-500 font-medium">Distinct Ayahs Engaged: <strong className="text-neutral-800">{totalVersesRead}</strong></p>
                       </div>

                    </div>
                 </div>
              </div>

           </div>
        </main>
      )}
    </div>
  );
};

export default InsightsPage;
