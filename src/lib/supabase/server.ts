import { createServerClient, type CookieOptions, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";
import { createFallbackSupabaseClient } from "@/lib/supabase/fallback";

type CookieUpdate = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function getSupabaseAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function createSupabaseServerContext(
  request: NextRequest
): {
  supabase: SupabaseClient;
  applyCookies(response: NextResponse): NextResponse;
} {
  if (!hasSupabaseEnv()) {
    const supabase = createFallbackSupabaseClient() as unknown as SupabaseClient;

    return {
      supabase,
      applyCookies(response: NextResponse) {
        return response;
      },
    };
  }

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
    cookieOptions: getSupabaseAuthCookieOptions(),
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
