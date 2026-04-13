import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Heart, Zap, Award, 
  RotateCcw, ArrowRight, Trophy, Sparkles 
} from 'lucide-react';
import { unlockBadge } from '../services/nudgeService';

const QuestPlay: React.FC = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [hearts, setHearts] = useState(3);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultMode, setResultMode] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    const startLevel = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('quest_hearts, quest_hints')
        .eq('id', user?.id)
        .single();
      
      setHearts(profile?.quest_hearts || 3);
      setHints(profile?.quest_hints || 0);

      const { data: qs } = await supabase
        .from('quest_questions')
        .select('*')
        .eq('level_number', levelId)
        .order('created_at', { ascending: true });
      
      setQuestions(qs || []);
      setLoading(false);
    };
    startLevel();
  }, [levelId]);

  const handleSelection = (optionIndex: number) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = optionIndex;
    setUserAnswers(updatedAnswers);

    // Auto-advance after a short delay for a "snappy" feel
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowHint(false);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_index) score++;
    });

    const isPerfect = score === questions.length; 

    if (isPerfect) {
      setResultMode('success');
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch current coins to increment
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('quest_coins')
        .eq('id', user?.id)
        .single();

      await supabase.from('user_profiles').update({ 
        current_quest_level: Number(levelId) + 1,
        quest_hearts: 3,
        quest_coins: (profile?.quest_coins || 0) + 1 // Award 1 coin for perfect run
      }).eq('id', user?.id);

      await unlockBadge(`level_${levelId}`);
    } else {
      setResultMode('fail');
      // Lose one heart for a failed attempt
      const newHearts = hearts - 1;
      setHearts(newHearts);
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('user_profiles').update({ quest_hearts: newHearts }).eq('id', user?.id);
    }
  };

  const useHint = async () => {
    if (hints > 0 && !showHint) {
      const { data: { user } } = await supabase.auth.getUser();
      const newHints = hints - 1;
      await supabase.from('user_profiles').update({ quest_hints: newHints }).eq('id', user?.id);
      setHints(newHints);
      setShowHint(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center font-display text-[#00695C] animate-pulse">Initializing Mission...</div>;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // --- RESULT VIEW ---
  if (resultMode) {
    return (
      <div className="min-h-screen bg-[#00695C] flex flex-col items-center justify-center px-8 text-white">
        <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mb-8 backdrop-blur-xl">
          {resultMode === 'success' ? <Trophy size={48} className="text-amber-400" /> : <RotateCcw size={48} />}
        </div>
        <h2 className="text-4xl font-display font-bold mb-2">
          {resultMode === 'success' ? 'Perfect Mission!' : 'Mission Failed'}
        </h2>
        <p className="text-white/60 text-center mb-12 max-w-xs leading-relaxed">
          {resultMode === 'success' 
            ? `100% Correct! You earned 1 Coin 🪙 and mastered Level ${levelId}.`
            : `Some answers were incorrect. You didn't earn a coin. Review and try again.`}
        </p>
        <button 
          onClick={() => resultMode === 'success' ? navigate('/quest') : window.location.reload()}
          className="w-full max-w-xs bg-white text-[#00695C] py-5 rounded-[24px] font-bold shadow-2xl shadow-black/20 active:scale-95 transition-all"
        >
          {resultMode === 'success' ? 'Claim Reward' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-body">
      {/* --- HUD --- */}
      <nav className="px-6 py-8 flex items-center justify-between">
        <button onClick={() => navigate('/quest')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
          <ChevronLeft size={20} className="text-secondary" />
        </button>
        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-3xl shadow-sm border border-neutral-100">
           <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={14} className={i < hearts ? "fill-red-500 text-red-500" : "text-neutral-200"} />
              ))}
           </div>
           <div className="w-px h-4 bg-neutral-100" />
           <div className="flex items-center gap-1.5 text-[#00695C] font-bold text-xs">
              <Zap size={14} fill="#00695C" /> {hints}
           </div>
        </div>
      </nav>

      {/* --- QUESTION AREA --- */}
      <main className="flex-grow flex flex-col px-6 max-w-2xl mx-auto w-full">
        <div className="mt-4 mb-10">
           <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00695C]">Mission Progress</span>
              <span className="text-xs font-bold text-neutral-400">{currentIndex + 1} / {questions.length}</span>
           </div>
           <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00695C] transition-all duration-700" 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
           </div>
        </div>

        <div className="flex-grow">
           <h2 className="text-3xl font-display font-bold text-secondary leading-tight mb-12">
             {currentQ.question_text}
           </h2>

           <div className="grid gap-4">
              {currentQ.options.map((opt: string, i: number) => {
                const isSelected = userAnswers[currentIndex] === i;
                return (
                  <button 
                    key={i} 
                    onClick={() => handleSelection(i)}
                    className={`group w-full p-6 text-left rounded-[28px] border-2 transition-all flex items-center justify-between ${
                      isSelected 
                      ? 'bg-[#00695C] border-[#00695C] text-white shadow-xl translate-x-2' 
                      : 'bg-white border-white shadow-sm hover:border-neutral-100'
                    }`}
                  >
                    <span className="font-medium text-lg">{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-white bg-white/20' : 'border-neutral-100'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
           </div>
        </div>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="py-10 space-y-4">
          {showHint && (
            <div className="bg-[#00695C]/5 border border-[#00695C]/10 p-5 rounded-[24px] animate-in slide-in-from-bottom-4">
              <p className="text-sm text-[#00695C] leading-relaxed italic">
                <Sparkles size={14} className="inline mr-2" />
                {currentQ.hint_clue}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={useHint}
              disabled={hints <= 0 || showHint}
              className="w-16 h-16 bg-white border border-neutral-100 rounded-[24px] flex items-center justify-center text-[#00695C] shadow-sm disabled:opacity-20 active:scale-95 transition-all"
            >
              <Zap size={24} />
            </button>
            
            <button 
              onClick={() => isLastQuestion ? handleSubmit() : setCurrentIndex(prev => prev + 1)}
              disabled={userAnswers[currentIndex] === undefined}
              className={`flex-grow h-16 rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                userAnswers[currentIndex] !== undefined 
                ? 'bg-[#00695C] text-white shadow-lg shadow-teal-900/20' 
                : 'bg-neutral-100 text-neutral-300'
              }`}
            >
              {isLastQuestion ? 'Submit Mission' : 'Next Question'} 
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestPlay;