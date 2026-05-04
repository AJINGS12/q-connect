export type InteractionType = 'scroll' | 'recite' | 'listen' | 'bookmark' | 'repeat_view';

export interface UserActivity {
  id?: string; // Optional because DB will auto-generate it (UUID)
  user_id: string;
  surah_number: number;
  ayah_number: number;
  interaction_type: InteractionType;
  timestamp_start: string; // ISO String
  timestamp_end: string;   // ISO String
  duration_seconds: number;
  visibility_ratio: number;
  scroll_velocity: number;
  confidence_score?: number; // Built-in for future AI features
  session_id: string;
}

// Data models for the aggregated tracking and scoring system
export interface EngagementMetrics {
  consistencyScore: number;
  engagementQualityScore: number;
  memorizationScore: number;
  reflectionScore: number;
  compositeSES: number;
}
