// src/services/nudgeService.ts
import { supabase } from '../lib/supabaseClient'; 

// --- DATABASE TYPES ---
export interface ThemeVerse {
  id: number;
  theme: string;
  surah_id: number;
  verse_number: number;
  verse_key: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  context: string;
  created_at?: string;
}

export interface Reflection {
  id: number;
  user_id: string;
  verse_key: string;
  reflection_text: string;
  arabic_text?: string;
  translation_text?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  role: 'student' | 'worker' | 'parent';
  themes: string[];
  preferred_mode: 'read' | 'listen' | 'reflect';
  created_at: string;
}

export interface Badge {
  id: string;
  badge_name: string;
  badge_icon: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  criteria_type: string;
  target_id?: string;
}

// --- HELPER: GET CURRENT TIME BLOCK ---
export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

// --- CORE: FETCH DAILY CONTEXTUAL NUDGE ---
export const getDailyNudge = async (): Promise<ThemeVerse | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Profile not found or error:', profileError);
      return null;
    }

    const timeOfDay = getTimeOfDay();

    const { data: verses, error: versesError } = await supabase
      .from('theme_verses')
      .select('*')
      .in('theme', profile.themes)
      .eq('time_of_day', timeOfDay);

    if (versesError || !verses || verses.length === 0) {
      console.error('No matching verses found:', versesError);
      return null;
    }

    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    return randomVerse;

  } catch (error) {
    console.error('Error in getDailyNudge:', error);
    return null;
  }
};

// --- REFLECTIONS: SAVE OR UPDATE JOURNAL ENTRY ---
// Fixed the 400 Bad Request error by removing the .upsert logic
export const saveReflection = async (
  verseKey: string, 
  reflectionText: string,
  arabicText?: string,
  translationText?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    // 1. Check if a reflection already exists for this verse to avoid duplicates
    const { data: existing } = await supabase
      .from('reflections')
      .select('id')
      .eq('user_id', user.id)
      .eq('verse_key', verseKey)
      .maybeSingle();

    let result;

    if (existing) {
      // 2. Try Full Update first
      result = await supabase
        .from('reflections')
        .update({
          reflection_text: reflectionText,
          arabic_text: arabicText,
          translation_text: translationText,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      // --- FAILSAFE: If Full Update fails, try Basic Update ---
      if (result.error) {
        console.warn('Full update failed, falling back to basic update...', result.error);
        result = await supabase
          .from('reflections')
          .update({
            reflection_text: reflectionText,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } else {
      // 3. Try Full Insert first
      result = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          verse_key: verseKey,
          reflection_text: reflectionText,
          arabic_text: arabicText,
          translation_text: translationText
        });

      // --- FAILSAFE: If Full Insert fails, try Basic Insert ---
      if (result.error) {
        console.warn('Full insert failed, falling back to basic insert...', result.error);
        result = await supabase
          .from('reflections')
          .insert({
            user_id: user.id,
            verse_key: verseKey,
            reflection_text: reflectionText
          });
      }
    }

    if (result.error) {
      console.error('Error in saveReflection operation:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveReflection:', error);
    return { success: false, error: 'Failed to save reflection' };
  }
};

// --- REFLECTIONS: EXPLICIT UPDATE BY ID ---
export const updateReflection = async (
  id: number, 
  newText: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('reflections')
      .update({ 
        reflection_text: newText,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating reflection:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateReflection:', error);
    return { success: false, error: 'Failed to update reflection' };
  }
};

// --- REFLECTIONS: FETCH ALL USER ENTRIES ---
export const getUserReflections = async (): Promise<Reflection[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reflections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserReflections:', error);
    return [];
  }
};

// --- REFLECTIONS: FETCH REFLECTION BY VERSE ---
export const getReflectionByVerse = async (verseKey: string): Promise<Reflection | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('verse_key', verseKey)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching reflection:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getReflectionByVerse:', error);
    return null;
  }
};

// --- PROFILE: INITIALIZE OR UPDATE PREFERENCES ---
export const updateUserProfile = async (
  role: 'student' | 'worker' | 'parent',
  themes: string[],
  preferredMode: 'read' | 'listen' | 'reflect'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        role,
        themes,
        preferred_mode: preferredMode
      });

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
};

// --- PROFILE: GET CURRENT PREFERENCES ---
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// --- BADGES: UNLOCK ACHIEVEMENT ---
export const unlockBadge = async (targetId: string): Promise<{ success: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const unlockedAt = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('badge_progress')
      .update({ 
        is_unlocked: true, 
        unlocked_at: unlockedAt
      })
      .eq('user_id', user.id)
      .eq('target_id', targetId)
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error unlocking badge:', error);
      return { success: false };
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase
        .from('badge_progress')
        .insert({
          user_id: user.id,
          target_id: targetId,
          badge_name: targetId,
          badge_icon: '🏅',
          criteria_type: 'milestone',
          is_unlocked: true,
          unlocked_at: unlockedAt,
        });

      if (insertError) {
        console.error('Error inserting unlocked badge:', insertError);
        return { success: false };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unlockBadge:', error);
    return { success: false };
  }
};

// --- BADGES: FETCH ALL FOR TROPHY ROOM ---
export const getUserBadges = async (): Promise<Badge[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('badge_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('is_unlocked', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};