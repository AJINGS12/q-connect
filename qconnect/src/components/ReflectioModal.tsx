import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { saveReflection, getReflectionByVerse } from '../services/nudgeService';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string;
  verseText: string;
  translation: string;
  onSave?: () => void; // Add callback for when reflection is saved
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  verseKey,
  verseText,
  translation,
  onSave
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingReflection, setExistingReflection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExistingReflection();
    }
  }, [isOpen, verseKey]);

  const loadExistingReflection = async () => {
    setIsLoading(true);
    try {
      const reflection = await getReflectionByVerse(verseKey);
      if (reflection) {
        setExistingReflection(reflection.reflection_text);
        setReflectionText(reflection.reflection_text);
      } else {
        setExistingReflection(null);
        setReflectionText('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reflectionText.trim()) return;

    setSaving(true);
    const result = await saveReflection(verseKey, reflectionText);
    
    if (result.success) {
      setSaved(true);
      onSave?.(); // Call the callback to refresh parent components
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00695C] text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {existingReflection ? 'My Reflection' : 'New Reflection'}
                </h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Verse {verseKey}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          
          {/* Verse Display */}
          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
            <p className="font-arabic text-3xl text-right mb-6 leading-[1.8] text-neutral-800 dir-rtl">
              {verseText}
            </p>
            <p className="text-neutral-500 text-lg font-light leading-relaxed italic">
              "{translation}"
            </p>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                 Your Spiritual Notes
               </label>
               {isLoading && <Loader2 className="animate-spin text-teal-600" size={16} />}
            </div>
            
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What wisdom do you take from this today?"
              className="w-full h-48 p-6 bg-neutral-50 border-none rounded-3xl focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-neutral-700 text-base"
            />
          </div>

          {/* Prompt Nudge */}
          <div className="flex items-start gap-4 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
            <Sparkles size={20} className="text-teal-600 shrink-0" />
            <p className="text-sm text-teal-800 font-medium leading-relaxed">
              Reflection helps bridge the gap between reading and living. How will you apply this verse to your current challenges?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-neutral-100 text-neutral-500 rounded-2xl font-bold hover:bg-neutral-200 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!reflectionText.trim() || saving || saved}
              className={`flex-[2] py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                saved ? 'bg-green-500' : 'bg-[#00695C] hover:scale-[1.02] active:scale-95'
              } disabled:opacity-50 disabled:scale-100`}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : saved ? <CheckCircle2 size={20} /> : null}
              {saving ? 'Saving...' : saved ? 'Reflection Saved' : existingReflection ? 'Update Reflection' : 'Save Reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionModal;