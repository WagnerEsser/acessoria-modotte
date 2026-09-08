import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/admin-authorization";

export type AdminIdentity = {
  name: string;
  email: string;
  role?: AdminRole;
};

export type AdminIdentityResult =
  | { status: "authenticated"; identity: AdminIdentity }
  | { status: "anonymous" }
  | { status: "unauthorized" };

type AdminProfile = {
  full_name: string;
  email: string | null;
  role: AdminRole;
  is_active: boolean;
};

export async function getVerifiedAdminIdentity(
  supabase: SupabaseClient,
): Promise<AdminIdentityResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "anonymous" };
  }

  const { data, error: profileError } = await supabase
    .from("users")
    .select("full_name, email, role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  const profile = data as AdminProfile | null;

  if (
    profileError ||
    !profile ||
    !["admin", "superadmin"].includes(profile.role) ||
    !profile.is_active
  ) {
    return { status: "unauthorized" };
  }

  return {
    status: "authenticated",
    identity: {
      name: profile.full_name.trim() || "Administrador",
      email:
        user.email?.trim() || profile.email?.trim() || "E-mail não informado",
      role: profile.role,
    },
  };
}
