-- Update reminders table to support specific dates
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS reminder_date DATE;

-- Comment out the previous parts if you already ran them
/*
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  days TEXT[] NOT NULL DEFAULT '{}',
  reminder_date DATE, -- NEW: Support for specific one-time dates
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
  ON reminders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
