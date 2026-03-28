import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://cudyqgzvukmzasjshsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZHlxZ3p2dWttemFzanNoc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDQwMjcsImV4cCI6MjA5MDI4MDAyN30.UARptzKqTPfC_3J8OFRY06mou2e9J21lghH1Jm7WRgo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
