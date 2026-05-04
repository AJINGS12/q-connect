-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  days TEXT[] NOT NULL, -- e.g. ['Friday', 'Monday']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own reminders"
  ON reminders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
