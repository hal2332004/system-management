import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Client thông thường — dùng cho mọi thao tác frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
