import { createServerClient, type CookieOptions, type CookieMethodsServer } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

type CookieUpdate = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createSupabaseServerContext(request: NextRequest) {
  const pendingCookies: CookieUpdate[] = [];
  const pendingHeaders = new Map<string, string>();

  const cookies: CookieMethodsServer = {
    getAll: () =>
      request.cookies.getAll().map(({ name, value }) => ({
        name,
        value,
      })),
    setAll: async (cookiesToSet, headers) => {
      pendingCookies.push(...cookiesToSet);

      for (const [name, value] of Object.entries(headers)) {
        pendingHeaders.set(name, value);
      }
    },
  };

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies,
  });

  return {
    supabase,
    applyCookies(response: NextResponse) {
      for (const [name, value] of pendingHeaders.entries()) {
        response.headers.set(name, value);
      }

      for (const cookie of pendingCookies) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }

      return response;
    },
  };
}
