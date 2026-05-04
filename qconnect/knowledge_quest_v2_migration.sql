-- 1. Alter quest_questions for new question types
ALTER TABLE public.quest_questions 
ADD COLUMN IF NOT EXISTS question_type text DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS explanation text;

-- Make options and correct_index nullable since reflection questions don't use them
ALTER TABLE public.quest_questions ALTER COLUMN options DROP NOT NULL;
ALTER TABLE public.quest_questions ALTER COLUMN correct_index DROP NOT NULL;

-- 2. Create table for storing user reflections
CREATE TABLE IF NOT EXISTS public.quest_reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.quest_questions(id) ON DELETE CASCADE,
  reflection_text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on the new table
ALTER TABLE public.quest_reflections ENABLE ROW LEVEL SECURITY;

-- Create Policies for quest_reflections
-- Users can only see their own reflections
CREATE POLICY "Users can view their own reflections" 
ON public.quest_reflections FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own reflections
CREATE POLICY "Users can insert their own reflections" 
ON public.quest_reflections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reflections
CREATE POLICY "Users can update their own reflections" 
ON public.quest_reflections FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own reflections
CREATE POLICY "Users can delete their own reflections" 
ON public.quest_reflections FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Update existing questions to have 'multiple_choice' and clear explanations if any (optional cleanup)
UPDATE public.quest_questions SET question_type = 'multiple_choice' WHERE question_type IS NULL;

-- 4. Seed Data: Clear out the existing Level 1 questions and replace them with the new varied types
-- (The destructive operation warning is because of this DELETE statement, but it is intentional and safe!)
DELETE FROM public.quest_questions WHERE level = 1;

-- Question 1: Scenario-Based Reflection Questions
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'Your coworker just made a big mistake that affected your project. Based on the verse "And speak to people good words" (2:83), what would be the best response?',
  '["Point out their mistake publicly so they learn", "Stay silent but complain to others later", "Speak to them privately with kind words", "Report them to your manager immediately"]'::jsonb,
  2,
  'Remember the importance of kindness even when frustrated.',
  'multiple_choice',
  'The Quran teaches us to address issues with kindness, even when we are frustrated. "Good words" means choosing words that heal, not harm.'
);

-- Question 2: "What Would You Do?" Interactive Stories
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'You found $100 on the ground at the mall. Nobody is around. What do you do?',
  '["Keep it - \"Finders keepers\"", "Turn it into mall security", "Keep it but donate to charity", "Post on social media to find owner"]'::jsonb,
  1,
  'Think about the concept of Amana (trust).',
  'multiple_choice',
  'Quran says: "Indeed, Allah commands you to return trusts to their owners" (4:58). You chose wisely! Even when no one is watching, returning what does not belong to us is the honest path.'
);

-- Question 3: "Complete the Wisdom" Pattern Matching
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'Complete the Wisdom: "With hardship comes ____"',
  '["punishment", "ease", "more hardship", "confusion"]'::jsonb,
  1,
  'Read Surah Ash-Sharh (94:5-6).',
  'multiple_choice',
  'From Surah Ash-Sharh (94:5-6): "For indeed, with hardship [will be] ease." When you are going through a tough time, remember: relief is already on its way.'
);

-- Question 4: "Verse Detective" - Find the Connection
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'What connects these situations? - Student stressed about failing exam. - Parent worried about paying bills. - Worker anxious about presentation. Which verse speaks to all of them?',
  '["\"Whoever fears Allah, He will make a way out\" (65:2)", "\"Do not grieve; indeed Allah is with us\" (9:40)", "\"Allah does not burden a soul beyond it can bear\" (2:286)", "\"Be patient, for Allah is with the patient\" (8:46)"]'::jsonb,
  2,
  'It relates to personal capacity and limits.',
  'multiple_choice',
  'All three situations involve fear of being overwhelmed. This verse reminds us that Allah never gives us more than we can handle. You HAVE the capacity for this.'
);

-- Question 5: "Verse in Context" - Timeline Understanding
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'The early Muslims in Makkah were being tortured, boycotted, and mocked for their faith. Many wanted to give up. Then this verse was revealed: "So verily, with hardship comes ease" (94:5). Why was this verse revealed at THIS moment?',
  '["To make them memorize more Quran", "To give them hope during persecution", "To test their knowledge", "To explain theology"]'::jsonb,
  1,
  'Think about the immediate emotional needs of the early Muslims.',
  'multiple_choice',
  'Just like the early Muslims faced mockery, you might face jokes or pressure. This verse was for THEM and for YOU. History + Relevance = Deeper understanding.'
);

-- Question 6: "Reflection Challenges" - Not Multiple Choice
INSERT INTO public.quest_questions (level, question_text, options, correct_index, hint_clue, question_type, explanation)
VALUES (
  1,
  'Think of ONE way you could give (time, kindness, money, or knowledge) this week, even if you feel like you don''t have much to give. Based on the verse: "Those who spend in prosperity and adversity" (3:134).',
  NULL,
  NULL,
  'Your reflection will be saved in your journey journal.',
  'reflection',
  'Your thoughtful intention has been recorded. "Those who spend in prosperity and adversity" reminds us that charity isn''t just about wealth.'
);
