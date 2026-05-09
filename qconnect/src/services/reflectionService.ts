export interface ReflectionPrompt {
  id: string;
  type: 'completion' | 'milestone' | 'exit';
  text: string;
  verse_snippet?: string;
}

const generalExitPrompts: string[] = [
  "Before you go, carry one verse with you today.",
  "Let the tranquility of your reading stay with you throughout the day.",
  "How will you apply the wisdom you just read to your next hour?",
  "A small, consistent deed is most beloved. You've done well today."
];

const surahSpecificPrompts: Record<number, { completion?: string; milestone?: string }> = {
  1: { // Al-Fatihah
    completion: "You've just recited the Opening. How can you carry this 'Straight Path' into your decisions today?",
  },
  103: { // Al-Asr
    completion: "This Surah reminds us about the value of time. What part of your day feels most meaningful lately?",
  },
  93: { // Ad-Duha
    completion: "'Did He not find you lost and guide you?' Take five seconds to think about one form of guidance you received recently.",
  },
  2: { // Al-Baqarah
    milestone: "Today's verses focused on patience and guidance. What challenge in your life requires patience right now?",
  },
  67: { // Al-Mulk
    completion: "You've finished the Kingdom. Look around you—what is one small sign of creation you often overlook?",
  }
};

export const getReflectionPrompt = (
  type: 'completion' | 'milestone' | 'exit',
  surahId?: number
): ReflectionPrompt => {
  if (type === 'exit') {
    const text = generalExitPrompts[Math.floor(Math.random() * generalExitPrompts.length)];
    return { id: `exit-${Date.now()}`, type, text };
  }

  if (surahId && surahSpecificPrompts[surahId]) {
    const specific = surahSpecificPrompts[surahId];
    if (type === 'completion' && specific.completion) {
      return { id: `comp-${surahId}`, type, text: specific.completion };
    }
    if (type === 'milestone' && specific.milestone) {
      return { id: `mile-${surahId}`, type, text: specific.milestone };
    }
  }

  // Fallbacks
  const genericPrompts = {
    completion: "You've completed this chapter. Take a moment to sit with the silence and the message.",
    milestone: "You're making beautiful progress. What verse from this session stood out to you most?",
  };

  return { 
    id: `${type}-generic`, 
    type, 
    text: genericPrompts[type as keyof typeof genericPrompts] || genericPrompts.completion 
  };
};
