import React, { useEffect, useState } from 'react';
import { X, Sparkles, Bookmark, Share2 } from 'lucide-react';
import { ReflectionPrompt } from '../services/reflectionService';

interface ContextualCompanionProps {
  prompt: ReflectionPrompt | null;
  onClose: () => void;
  onAction?: (action: 'save' | 'share') => void;
}

const ContextualCompanion: React.FC<ContextualCompanionProps> = ({ prompt, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prompt) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [prompt]);

  if (!prompt || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 sm:pb-12 pointer-events-none">
      {/* Backdrop for click-outside dismissal */}
      <div 
        className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-500" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-8 md:p-10 pointer-events-auto animate-in slide-in-from-bottom-12 duration-700 ease-out">
        
        {/* Header decoration */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Contextual Companion</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-300 hover:text-neutral-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {prompt.verse_snippet && (
            <p className="text-right font-arabic text-xl text-neutral-400 opacity-60 leading-relaxed italic">
              "{prompt.verse_snippet}"
            </p>
          )}
          
          <h3 className="text-xl md:text-2xl font-display font-bold text-secondary leading-relaxed italic">
            "{prompt.text}"
          </h3>

          <div className="pt-4 flex items-center justify-between border-t border-neutral-100/50">
            <div className="flex gap-4">
              <button 
                onClick={() => onAction?.('save')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-primary hover:border-primary/20 transition-all"
                title="Save to favorites"
              >
                <Bookmark size={18} />
              </button>
              <button 
                onClick={() => onAction?.('share')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-primary hover:border-primary/20 transition-all"
                title="Share reflection"
              >
                <Share2 size={18} />
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-secondary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/10 hover:shadow-secondary/20 active:scale-95 transition-all"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Bottom subtle text */}
        <div className="mt-6 text-center">
          <p className="text-[9px] font-medium text-neutral-300 uppercase tracking-widest italic">Take a moment for silence.</p>
        </div>
      </div>
    </div>
  );
};

export default ContextualCompanion;
