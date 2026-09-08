import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminRole = "superadmin" | "admin" | "editor";

export async function getCurrentAdminRole(supabase: SupabaseClient): Promise<AdminRole | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data, error } = await supabase.from("users").select("role, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (error || !data?.is_active) return null;
  return data.role === "superadmin" || data.role === "admin" || data.role === "editor" ? data.role : null;
}

export async function isCurrentSuperAdmin(supabase: SupabaseClient) {
  return (await getCurrentAdminRole(supabase)) === "superadmin";
}
