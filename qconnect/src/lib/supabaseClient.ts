import { createClient } from '@supabase/supabase-js'

// Copy these EXACTLY from Supabase Dashboard > Settings > API
const supabaseUrl = 'https://tgnuupuerplahzjpftzb.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbnV1cHVlcnBsYWh6anBmdHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY5NDMsImV4cCI6MjA5MTQxMjk0M30.tMMNL8W-8r6hIupETDbVMIOgoGatnhw1VhZ66MRi65Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)