import React from 'react';
import { X, CheckCircle2, Trophy, Zap } from 'lucide-react';

interface QuestOnboardingProps {
  onClose: () => void;
}

const QuestOnboarding: React.FC<QuestOnboardingProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#004D40]/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
        
        <div className="flex justify-between items-center mb-6 relative">
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
             <Trophy size={24} />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-300 hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1 mb-6 relative">
          <h2 className="text-3xl font-display font-bold text-secondary tracking-tight">
            Knowledge <br/><span className="text-primary">Quest</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light">Simple steps to track your progress.</p>
        </div>

        <div className="space-y-6 mb-8 relative">
          {[
            { 
              icon: <CheckCircle2 className="text-teal-500" size={18} />, 
              title: "Complete Levels", 
              desc: "Read and answer questions to finish levels." 
            },
            { 
              icon: <Zap className="text-amber-500" size={18} />, 
              title: "Earn Points", 
              desc: "Get points for every correct answer." 
            },
            { 
              icon: <Trophy className="text-primary" size={18} />, 
              title: "Stay Focused", 
              desc: "Finish with your attempts remaining." 
            }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="shrink-0 w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-secondary text-sm">{item.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed italic">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-primary text-white py-4 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
        >
          Let's Begin
        </button>
      </div>
    </div>
  );
};

export default QuestOnboarding;
