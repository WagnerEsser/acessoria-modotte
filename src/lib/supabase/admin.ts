import type { SupabaseClient } from "@supabase/supabase-js";

export async function canAccessAdmin(
  supabase: Pick<SupabaseClient, "rpc">
): Promise<boolean> {
  const { data, error } = await supabase.rpc("current_user_is_admin");

  if (error) {
    return false;
  }

  return data === true;
}
