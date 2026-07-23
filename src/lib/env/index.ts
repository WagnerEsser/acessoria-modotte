function getOptionalEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function getFirstConfiguredEnv(names: string[]): string {
  for (const name of names) {
    const value = getOptionalEnv(name);

    if (value) {
      return value;
    }
  }

  return "";
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    getFirstConfiguredEnv([
      "SUPABASE_URL",
      "SUPABASE_INTERNAL_URL",
      "SUPABASE_PUBLIC_URL",
      "API_EXTERNAL_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]) &&
      getFirstConfiguredEnv([
        "SUPABASE_ANON_KEY",
        "ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ])
  );
}

export function getSupabaseUrl(): string {
  const value = getFirstConfiguredEnv([
    "SUPABASE_URL",
    "SUPABASE_INTERNAL_URL",
    "SUPABASE_PUBLIC_URL",
    "API_EXTERNAL_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]);

  if (!value) {
    throw new Error("Missing required environment variable: SUPABASE_URL");
  }

  return value;
}

export function getSupabaseAnonKey(): string {
  const value = getFirstConfiguredEnv([
    "SUPABASE_ANON_KEY",
    "ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);

  if (!value) {
    throw new Error("Missing required environment variable: SUPABASE_ANON_KEY");
  }

  return value;
}

export function getSupabaseServiceRoleKey(): string {
  const value = getFirstConfiguredEnv(["SUPABASE_SECRET_KEY", "SERVICE_ROLE_KEY"]);

  if (!value) {
    throw new Error("Missing required server-only Supabase secret key");
  }

  return value;
}
