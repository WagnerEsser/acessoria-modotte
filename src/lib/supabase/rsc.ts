import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export async function createSupabaseRscClient() {
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
