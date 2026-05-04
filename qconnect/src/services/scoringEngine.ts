import { type UserActivity, type EngagementMetrics } from '../types/activity';

/**
 * Calculates the Spiritual Engagement Score (SES) based on user activity events.
 * SES = 0.40 * Consistency + 0.25 * EngagementQuality + 0.20 * Memorization + 0.15 * Reflection
 */

// A. Consistency Score (40%)
export function calculateConsistencyScore(activeDaysLast30: number, currentStreak: number): number {
  const timeFactor = (activeDaysLast30 / 30) * 70;
  const streakBonus = Math.log(1 + currentStreak) * 30;
  return Math.min(100, timeFactor + streakBonus);
}

// B. Engagement Quality Score (25%)
// Based on visibility, dwell time, and revisit counts preventing speed scrolling.
export function calculateEngagementQualityScore(events: UserActivity[]): number {
  if (!events || events.length === 0) return 0;
  
  const relevantEvents = events.filter(e => e.interaction_type === 'scroll' || e.interaction_type === 'recite');
  if (relevantEvents.length === 0) return 0;

  // Track revisits
  const revisitCounts: Record<string, number> = {};

  let totalVerseScore = 0;
  
  for (const event of relevantEvents) {
    const verseKey = `${event.surah_number}:${event.ayah_number}`;
    
    // 1. Visibility Weight
    const visibilityWeight = event.visibility_ratio >= 0.7 ? 1 : 0;
    
    // 2. Time Factor 
    // <2 sec -> almost 0, optimal between 5-15 sec.
    let timeOnVerseFactor = 0;
    if (event.duration_seconds >= 1) {
       timeOnVerseFactor = Math.min(1, Math.max(0, Math.log(event.duration_seconds + 1) / 3));
    }

    // 3. Revisit Bonus
    const currentRevisits = revisitCounts[verseKey] || 0;
    const revisitBonus = Math.min(1.5, 1 + (0.1 * currentRevisits)); // Diminishing returns capped at +50%
    revisitCounts[verseKey] = currentRevisits + 1;

    let verseScore = visibilityWeight * timeOnVerseFactor * revisitBonus;
    
    // Cap engagement farming per session by enforcing max value per verse
    verseScore = Math.min(1.2, verseScore); 
    
    totalVerseScore += verseScore;
  }

  // Average over session
  const averageEngagement = totalVerseScore / relevantEvents.length;
  
  // Multiply by 100 to standardize 0-100 scale.
  return Math.min(100, averageEngagement * 100);
}

// C. Memorization Score (20%)
export function calculateMemorizationScore(events: UserActivity[], targetVerses = 6236): number {
  const repeatViews = new Set<string>();
  let recitationCount = 0;
  
  for (const ev of events) {
    if (ev.interaction_type === 'repeat_view') {
       repeatViews.add(`${ev.surah_number}:${ev.ayah_number}`);
    }
    if (ev.interaction_type === 'recite') recitationCount++;
  }

  const uniqueRepeats = repeatViews.size;
  const rawScore = (uniqueRepeats * 0.6) + (recitationCount * 0.4);
  
  // Normalize based on total
  // (In a real app targetVerses is either the whole Quran or the user's specific goal)
  let normalized = (rawScore / Math.max(1, (targetVerses * 0.05))) * 100; // Expected to not recite the WHOLE Quran randomly
  return Math.min(100, normalized);
}

// D. Reflection Score (15%)
export function calculateReflectionScore(events: UserActivity[]): number {
  let bookmarks = 0;
  let notes = 0; 
  let pauseIntentScore = 0;
  
  let lastEventTime = 0;

  for (const ev of events) {
     if (ev.interaction_type === 'bookmark') bookmarks++;
     
     // Evaluate pause intent if we have adjacent scroll events
     if (ev.interaction_type === 'scroll') {
         const currentStart = new Date(ev.timestamp_start).getTime();
         if (lastEventTime > 0) {
             const gapSeconds = (currentStart - lastEventTime) / 1000;
             if (gapSeconds > 10 && gapSeconds < 300) { // gaps over 5 min are likely inactive
                 pauseIntentScore += 1;
             }
         }
         lastEventTime = new Date(ev.timestamp_end).getTime();
     }
  }

  const rawReflection = (bookmarks * 2) + (notes * 5) + pauseIntentScore;
  return Math.min(100, rawReflection); // Cap at 100
}

// Master Function
export function getSpiritualEngagementScore(
  activeDaysLast30: number,
  currentStreak: number,
  sessionEvents: UserActivity[], 
  targetMemorizationGoalTotal: number = 200 // default realistic snapshot goal
): EngagementMetrics {
  
   const cScore = calculateConsistencyScore(activeDaysLast30, currentStreak);
   const eqScore = calculateEngagementQualityScore(sessionEvents);
   const mScore = calculateMemorizationScore(sessionEvents, targetMemorizationGoalTotal);
   const rScore = calculateReflectionScore(sessionEvents);

   const sesRaw = (0.40 * cScore) + (0.25 * eqScore) + (0.20 * mScore) + (0.15 * rScore);
   const compositeSES = (sesRaw / 100) * 1000; // Skewed out of 1000

   return {
     consistencyScore: cScore,
     engagementQualityScore: eqScore,
     memorizationScore: mScore,
     reflectionScore: rScore,
     compositeSES: compositeSES <= 1000 ? compositeSES : 1000
   };
}
