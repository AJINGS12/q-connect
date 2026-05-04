import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  ChevronLeft, Heart, Zap, RotateCcw, ArrowRight, Trophy, Sparkles, CheckCircle2, XCircle, Send
} from 'lucide-react';

const QuestPlay: React.FC = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for answers
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [currentReflectionText, setCurrentReflectionText] = useState('');
  
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultMode, setResultMode] = useState<'success' | 'fail' | null>(null);
  const [questionsFetchError, setQuestionsFetchError] = useState<string | null>(null);

  useEffect(() => {
    const startLevel = async () => {
      setLoading(true);
      setQuestionsFetchError(null);
      const parsedLevelId = Number(levelId);
      if (!Number.isFinite(parsedLevelId) || parsedLevelId <= 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setQuestionsFetchError('You need to be signed in to load quest questions.');
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('quest_hearts, quest_hints')
        .eq('id', user?.id)
        .single();
      
      setHearts(profile?.quest_hearts || 3);
      setHints(profile?.quest_hints || 0);

      const { data: qs, error: questionsError } = await supabase
        .from('quest_questions')
        .select('*')
        .eq('level', parsedLevelId)
        .order('id', { ascending: true });

      if (questionsError) {
        console.error('Failed to load quest questions:', questionsError.message);
        setQuestionsFetchError(questionsError.message);
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      setQuestions(qs || []);
      setLoading(false);
    };
    startLevel();
  }, [levelId]);

  const handleSelection = (optionIndex: number) => {
    if (isAnswerRevealed) return; // Lock answers once revealed
    
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = optionIndex;
    setUserAnswers(updatedAnswers);
    setIsAnswerRevealed(true);
  };

  const submitReflection = async () => {
    if (isAnswerRevealed || !currentReflectionText.trim()) return;
    
    setReflectionAnswers(prev => ({...prev, [currentIndex]: currentReflectionText}));
    setIsAnswerRevealed(true);
    
    // Save to DB and reward points
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quest_reflections').insert({
          user_id: user.id,
          question_id: questions[currentIndex].id,
          reflection_text: currentReflectionText
        });
        
        const { data: profile } = await supabase.from('user_profiles').select('quest_coins').eq('id', user.id).single();
        await supabase.from('user_profiles').update({ 
          quest_coins: (profile?.quest_coins || 0) + 15 
        }).eq('id', user.id);
      }
    } catch (err) {
      console.error('Failed to save reflection', err);
    }
  };

  const advanceQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerRevealed(false);
      setShowHint(false);
      setCurrentReflectionText('');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    let score = 0;
    let possibleScore = 0;
    
    questions.forEach((q, idx) => {
      if (q.question_type !== 'reflection') {
        possibleScore++;
        if (userAnswers[idx] === q.correct_index) score++;
      }
    });

    const hasPassed = possibleScore === 0 || score >= Math.ceil(possibleScore * 0.6);

    if (hasPassed) {
      setResultMode('success');
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('quest_coins, current_quest_level')
        .eq('id', user?.id)
        .single();

      // Ensure we don't go past max level 30
      const nextLevel = Math.min(Math.max(profile?.current_quest_level || 1, Number(levelId) + 1), 30);

      await supabase.from('user_profiles').update({ 
        current_quest_level: nextLevel,
        quest_hearts: 3,
        quest_coins: (profile?.quest_coins || 0) + 10 // Award 10 coins for level completion
      }).eq('id', user?.id);
    } else {
      setResultMode('fail');
      const newHearts = Math.max(hearts - 1, 0);
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

  if (loading) return <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center font-display text-[#00695C] animate-pulse">Loading Journey...</div>;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  if (!questions.length || !currentQ) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-display font-bold text-secondary mb-3">Challenge not available</h2>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm">
          {questionsFetchError ? `Error: ${questionsFetchError}` : 'This challenge has no content yet.'}
        </p>
        <button
          onClick={() => navigate('/quest')}
          className="bg-[#00695C] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
        >
          Back to Path
        </button>
      </div>
    );
  }

  const isReflection = currentQ.question_type === 'reflection';

  // --- RESULT VIEW ---
  if (resultMode) {
    return (
      <div className="min-h-screen bg-[#00695C] flex flex-col items-center justify-center px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#004d40] to-transparent opacity-50" />
        <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mb-8 backdrop-blur-xl relative z-10">
          {resultMode === 'success' ? <Trophy size={48} className="text-amber-400" /> : <RotateCcw size={48} />}
        </div>
        <h2 className="text-4xl font-display font-bold mb-2 relative z-10 text-center">
          {resultMode === 'success' ? 'Challenge Complete!' : 'Not Quite There'}
        </h2>
        <p className="text-white/60 text-center mb-12 max-w-sm leading-relaxed relative z-10">
          {resultMode === 'success'
            ? `Excellent reflection and understanding. You earned 10 points 🪙 and unlocked the next step on your path.`
            : `Some concepts need a bit more review. Try again to deepen your understanding.`}
        </p>
        <button 
          onClick={() => resultMode === 'success' ? navigate('/quest') : window.location.reload()}
          className="w-full max-w-xs bg-white text-[#00695C] py-5 rounded-[24px] font-bold shadow-2xl shadow-black/20 active:scale-95 transition-all relative z-10"
        >
          {resultMode === 'success' ? 'Continue Journey' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-body transition-colors duration-500">
      {/* --- HUD --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm w-full">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/quest')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-primary/30 text-primary shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Quest</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Challenge</h1>
            </div>
          </div>
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
        </div>
      </nav>

      {/* --- QUESTION AREA --- */}
      <main className="flex-grow flex flex-col px-4 md:px-6 pb-16 md:pb-24 max-w-3xl mx-auto w-full">
        <div className="mt-2 mb-10">
           <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00695C]">Challenge Progress</span>
              <span className="text-xs font-bold text-neutral-400">{currentIndex + 1} / {questions.length}</span>
           </div>
           <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00695C] transition-all duration-700" 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
           </div>
        </div>

        <div className="flex-grow flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="mb-6 md:mb-10">
             {isReflection && (
                <span className="inline-block px-3 py-1 mb-4 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Deep Reflection (+15 pts)
                </span>
             )}
             <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary leading-relaxed whitespace-pre-wrap">
               {currentQ.question_text}
             </h2>
           </div>

           {isReflection ? (
             <div className="flex-grow flex flex-col">
               <textarea
                 value={currentReflectionText}
                 onChange={e => setCurrentReflectionText(e.target.value)}
                 disabled={isAnswerRevealed}
                 placeholder="Write your honest thoughts here..."
                 className={`w-full p-6 rounded-3xl border-2 resize-none flex-grow min-h-[200px] text-lg focus:outline-none transition-colors ${
                   isAnswerRevealed ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-white border-neutral-100 focus:border-primary focus:ring-4 focus:ring-primary/10'
                 }`}
               />
             </div>
           ) : (
             <div className="grid gap-4">
                {currentQ.options?.map((opt: string, i: number) => {
                  const isSelected = userAnswers[currentIndex] === i;
                  const isCorrectAnswer = i === currentQ.correct_index;
                  
                  let btnClass = 'bg-white border-neutral-100 shadow-sm hover:border-primary/30';
                  let icon = null;

                  if (isAnswerRevealed) {
                    if (isCorrectAnswer) {
                      btnClass = 'bg-teal-50 border-teal-500 text-teal-900 shadow-lg shadow-teal-500/10 scale-[1.02] z-10';
                      icon = <CheckCircle2 className="text-teal-600" />;
                    } else if (isSelected && !isCorrectAnswer) {
                      btnClass = 'bg-red-50 border-red-200 text-red-900 opacity-70';
                      icon = <XCircle className="text-red-400" />;
                    } else {
                      btnClass = 'bg-white border-neutral-100 opacity-50';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-[#00695C] border-[#00695C] text-white shadow-xl scale-[1.02]';
                  }

                  return (
                    <button 
                      key={i} 
                      onClick={() => handleSelection(i)}
                      disabled={isAnswerRevealed}
                      className={`w-full p-4 md:p-6 text-left rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between gap-3 ${btnClass}`}
                    >
                      <span className={`font-medium text-base md:text-lg ${isAnswerRevealed && isCorrectAnswer ? 'font-bold' : ''}`}>{opt}</span>
                      
                      <div className="shrink-0">
                        {isAnswerRevealed ? icon : (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-white bg-white/20' : 'border-neutral-200'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
             </div>
           )}

           {/* Explanation Box */}
           {isAnswerRevealed && currentQ.explanation && (
             <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-3xl animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest mb-3">
                  <Sparkles size={16} /> Wisdom Unlocked
                </div>
                <p className="text-secondary leading-relaxed font-medium">
                  {currentQ.explanation}
                </p>
             </div>
           )}
        </div>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="mt-12 space-y-4">
          {showHint && !isAnswerRevealed && (
            <div className="bg-[#00695C]/5 border border-[#00695C]/10 p-5 rounded-3xl animate-in slide-in-from-bottom-4">
              <p className="text-sm text-[#00695C] leading-relaxed font-medium">
                <Zap size={14} className="inline mr-2 fill-[#00695C]" />
                {currentQ.hint_clue}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {!isAnswerRevealed && !isReflection && (
              <button 
                onClick={useHint}
                disabled={hints <= 0 || showHint}
                className="w-16 h-16 bg-white border border-neutral-200 rounded-[24px] flex items-center justify-center text-[#00695C] shadow-sm disabled:opacity-30 active:scale-95 transition-all hover:bg-neutral-50"
              >
                <Zap size={24} />
              </button>
            )}
            
            {isReflection && !isAnswerRevealed ? (
              <button 
                onClick={submitReflection}
                disabled={!currentReflectionText.trim()}
                className={`flex-grow h-16 rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  currentReflectionText.trim()
                  ? 'bg-primary text-white shadow-lg shadow-teal-900/20 hover:bg-primary/90' 
                  : 'bg-neutral-100 text-neutral-300'
                }`}
              >
                Submit Reflection <Send size={18} />
              </button>
            ) : isAnswerRevealed ? (
              <button 
                onClick={advanceQuestion}
                className="flex-grow h-16 rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 animate-pulse-once"
              >
                {isLastQuestion ? 'Complete Challenge' : 'Continue'} <ArrowRight size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestPlay;