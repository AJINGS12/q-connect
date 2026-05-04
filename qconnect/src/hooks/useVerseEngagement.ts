import { useEffect, useRef } from 'react';
import { activityTrackerEngine } from '../services/activityService';

interface UseVerseEngagementProps {
  surahNumber: number;
  ayahNumber: number;
  externalRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Hook to track passive reading of a verse using IntersectionObserver.
 * It strictly adheres to the 0.7 visibility threshold and calculates dwell time.
 */
export function useVerseEngagement({ surahNumber, ayahNumber, externalRef }: UseVerseEngagementProps) {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const verseRef = externalRef || internalRef;
  
  // State refs (used to avoid re-triggering effects)
  const isCurrentlyVisible = useRef(false);
  const visibilityStartTime = useRef<number>(0);
  const maxIntersectionRatio = useRef<number>(0);
  const lastYPos = useRef<number>(0);

  useEffect(() => {
    const el = verseRef.current;
    if (!el) return;

    // We observe thresholds. 0.7 is the key threshold defined in the requirements.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const now = Date.now();
          
          if (ratio > maxIntersectionRatio.current) {
             maxIntersectionRatio.current = ratio;
          }

          // Case 1: Entering visibility zone (>= 0.7)
          if (ratio >= 0.7 && !isCurrentlyVisible.current) {
             isCurrentlyVisible.current = true;
             visibilityStartTime.current = now;
             lastYPos.current = entry.boundingClientRect.y;
          } 
          // Case 2: Exiting visibility zone (< 0.7) 
          else if (ratio < 0.7 && isCurrentlyVisible.current) {
             isCurrentlyVisible.current = false;
             const endTime = now;
             const duration = (endTime - visibilityStartTime.current) / 1000;
             const newY = entry.boundingClientRect.y;
             
             // Distance travelled in pixels.
             const distance = Math.abs(newY - lastYPos.current); 
             // Rough estimation of velocity (pixels per second)
             const velocity = duration > 0 ? distance / duration : 9999;
             
             // Commit the event to the batcher
             activityTrackerEngine.logEvent({
                user_id: '', // Handled by service
                surah_number: surahNumber,
                ayah_number: ayahNumber,
                interaction_type: 'scroll', // Passive reading
                timestamp_start: new Date(visibilityStartTime.current).toISOString(),
                timestamp_end: new Date(endTime).toISOString(),
                duration_seconds: duration,
                visibility_ratio: maxIntersectionRatio.current, // Might be 0.9 or 1.0 depending on scroll
                scroll_velocity: velocity
             });

             // Reset for next interaction (if user revisits by scrolling back up)
             maxIntersectionRatio.current = 0;
          }
        });
      },
      {
         root: null, // viewport
         threshold: [0, 0.3, 0.7, 0.9, 1.0], // Capture different granularities
         rootMargin: '0px'
      }
    );

    observer.observe(el);

    return () => {
       if (isCurrentlyVisible.current) {
          const duration = (Date.now() - visibilityStartTime.current) / 1000;
          if (duration >= 1) {
             activityTrackerEngine.logEvent({
                user_id: '',
                surah_number: surahNumber,
                ayah_number: ayahNumber,
                interaction_type: 'scroll',
                timestamp_start: new Date(visibilityStartTime.current).toISOString(),
                timestamp_end: new Date().toISOString(),
                duration_seconds: duration,
                visibility_ratio: maxIntersectionRatio.current > 0 ? maxIntersectionRatio.current : 0.7,
                scroll_velocity: 0 // Assuming they stopped here
             });
          }
       }
       // Cleanup observer on unmount
       observer.unobserve(el);
       observer.disconnect();
    };
  }, [surahNumber, ayahNumber]);

  return { verseRef };
}
