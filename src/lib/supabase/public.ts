import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";
import { createFallbackSupabaseClient } from "@/lib/supabase/fallback";

export function createSupabasePublicClient(): SupabaseClient {
  if (!hasSupabaseEnv()) {
    return createFallbackSupabaseClient() as unknown as SupabaseClient;
  }

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
