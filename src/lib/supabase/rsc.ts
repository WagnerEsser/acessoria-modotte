import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";
import { createFallbackSupabaseClient } from "@/lib/supabase/fallback";

export async function createSupabaseRscClient(): Promise<SupabaseClient> {
  if (!hasSupabaseEnv()) {
    return createFallbackSupabaseClient() as unknown as SupabaseClient;
  }

  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll: async () =>
      cookieStore.getAll().map(({ name, value }) => ({
        name,
        value,
      })),
  };

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: cookieMethods,
  });
}
