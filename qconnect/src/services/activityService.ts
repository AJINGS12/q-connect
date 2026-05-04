import { supabase } from '../lib/supabaseClient';
import type { UserActivity } from '../types/activity';

const EVENT_BATCH_KEY = 'qconnect_event_batch';

export class ActivityTracker {
  private static instance: ActivityTracker;
  private pendingEvents: UserActivity[] = [];
  private sessionId: string;
  private flushIntervalId: any = null;

  private constructor() {
    // Unique session ID generated per visit/refresh
    this.sessionId = crypto.randomUUID();
    this.loadFromStorage();
    
    // Auto flush every 15 seconds to prevent data loss on sudden closes
    this.flushIntervalId = setInterval(() => {
      this.flushToDatabase();
    }, 15000);
    
    // Flush on page exit
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToStorage();
      });
    }
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }
  
  public getSessionId(): string {
     return this.sessionId;
  }

  public logEvent(event: Omit<UserActivity, 'session_id'>) {
    if (event.duration_seconds < 1 && event.interaction_type === 'scroll') {
      console.log(`[Tracker] Dropping flick scroll: < 1s duration`);
      return; 
    }
    console.log(`[Tracker] Logged ${event.interaction_type} event for Ayah ${event.ayah_number} (Duration: ${event.duration_seconds.toFixed(2)}s)`);
    
    this.pendingEvents.push({
      ...event,
      session_id: this.sessionId,
    });
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(EVENT_BATCH_KEY, JSON.stringify(this.pendingEvents));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(EVENT_BATCH_KEY);
      if (saved) {
        try {
          this.pendingEvents = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse pending events", e);
        }
      }
    }
  }

  public async flushToDatabase() {
    if (this.pendingEvents.length === 0) return;

    // Filter out obvious bot speeds (Rule: scroll speed &lt; 1 sec per verse)
    // Anti-gaming protection
    const validEvents = this.pendingEvents.filter(ev => {
       if (ev.interaction_type === 'scroll') {
          // If duration is too short for any visibility, scrap it
          if (ev.duration_seconds < 1.0) return false;
          // If velocity is incredibly high (flicking), ignore
          if (ev.scroll_velocity > 3000) return false;
       }
       return true;
    });

    if (validEvents.length === 0) {
       this.pendingEvents = [];
       this.saveToStorage();
       return;
    }

    // Capture events pointer to clear, allowing arrays to fill concurrently without data loss
    const batch = [...validEvents];
    this.pendingEvents = [];
    this.saveToStorage();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is not logged in, we drop events
      if (!session) {
         console.warn('[Tracker] Sync aborted: You must be logged in to Supabase to persist stats.');
         return; 
      }
      
      console.log(`[Tracker] Syncing ${batch.length} valid events to Supabase...`);
      const userId = session.user.id;
      
      const payload = batch.map(b => ({
         ...b,
         user_id: userId
      }));

      // Insert all
      const { error } = await supabase.from('user_activity').insert(payload);
      
      if (error) {
         console.error('Failed to dump activity batch, re-queuing:', error);
         // Put them back at front
         this.pendingEvents = [...batch, ...this.pendingEvents];
         this.saveToStorage();
      }
    } catch (e) {
      console.error('Network Error dumping activity batch');
      this.pendingEvents = [...batch, ...this.pendingEvents];
      this.saveToStorage();
    }
  }
}

export const activityTrackerEngine = ActivityTracker.getInstance();
