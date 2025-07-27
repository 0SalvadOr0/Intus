import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tckgbigpycwvnxituehr.supabase.co'; // Sostituisci con il tuo URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRja2diaWdweWN3dm54aXR1ZWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTA3NjAsImV4cCI6MjA2OTE4Njc2MH0.L42ikaeyAC5q54YvrXZu0PO24dptZbdvsKp_4B9-ruA'; // Sostituisci con la tua anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
