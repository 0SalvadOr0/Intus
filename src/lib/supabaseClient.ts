import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASEURL; // Sostituisci con il tuo URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASEANONKEY; // Sostituisci con la tua anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
