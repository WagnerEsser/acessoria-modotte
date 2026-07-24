import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { getVerifiedAdminIdentity } from "@/lib/admin-identity";
import { buildAdminLoginUrl } from "@/lib/auth";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseRscClient();
  const result = await getVerifiedAdminIdentity(supabase);

  if (result.status === "anonymous") {
    redirect(buildAdminLoginUrl(undefined, "session_expired"));
  }

  if (result.status === "unauthorized") {
    redirect(buildAdminLoginUrl(undefined, "unauthorized"));
  }

  return <AdminShell currentUser={result.identity}>{children}</AdminShell>;
}
