import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
let fallback = false;
let initializationError: string | null = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    fallback = true;
    initializationError = "Missing Supabase environment variables";
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });    
  }
} catch (error) {
  fallback = true;
  initializationError =
    error instanceof Error ? error.message : "Unknown Supabase initialization error";
  client = null;
}

export const supabase = client;
export const isLocalFallback = fallback;
export const supabaseInitializationError = initializationError;

