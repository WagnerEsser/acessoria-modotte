import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";

export const dynamic = "force-dynamic";

export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
