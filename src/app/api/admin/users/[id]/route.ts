import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isCurrentSuperAdmin } from "@/lib/admin-authorization";
import { applyNoStoreHeaders, getAdminFormRequestRejection, getAdminRequestContext, getRequestOrigin } from "@/lib/auth";
import { readLimitedUrlEncodedForm } from "@/lib/security/request";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const updateSchema = z.object({
  action: z.literal("update"),
  full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().max(128).optional(),
  is_active: z.boolean(),
});

function redirectResult(request: NextRequest, params: Record<string, string>) {
  if (request.headers.get("accept")?.includes("application/json")) {
    const messages: Record<string, string> = {
      updated: "Usuário atualizado com sucesso.",
      deleted: "Usuário excluído com sucesso.",
      invalid_input: "Revise os dados informados.",
      operation_failed: "Não foi possível concluir a operação.",
      protected_user: "A conta principal não pode ser alterada.",
      not_found: "Usuário não encontrado.",
    };
    const key = params.status ?? params.error ?? "operation_failed";

    return applyNoStoreHeaders(
      NextResponse.json(
        {
          status: params.status ? "success" : "error",
          message: messages[key] ?? "Não foi possível concluir a operação.",
        },
        { status: params.status ? 200 : 400 },
      ),
    );
  }

  const url = new URL("/admin/usuarios", getRequestOrigin(request));
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return applyNoStoreHeaders(NextResponse.redirect(url, 303));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejection = getAdminFormRequestRejection(request);
  if (rejection) return applyNoStoreHeaders(NextResponse.json({ error: rejection.error }, { status: rejection.status }));
  const { id } = await params;
  const { supabase, isAuthorized } = await getAdminRequestContext(request);
  if (!isAuthorized || !(await isCurrentSuperAdmin(supabase))) return applyNoStoreHeaders(NextResponse.json({ error: "forbidden" }, { status: 403 }));
  let form: URLSearchParams;
  try { form = await readLimitedUrlEncodedForm(request, 8 * 1024); } catch { return redirectResult(request, { error: "invalid_input" }); }
  const service = createSupabaseServiceClient();
  const { data: target, error: targetError } = await service.from("users").select("id, auth_user_id, role, is_active").eq("id", id).maybeSingle();
  if (targetError || !target) return redirectResult(request, { error: "not_found" });
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (target.role === "superadmin" || target.auth_user_id === currentUser?.id) return redirectResult(request, { error: "protected_user" });
  if (form.get("action") === "toggle_active") {
    const { error } = await service.from("users").update({ is_active: form.get("is_active") === "on" }).eq("id", id);
    if (request.headers.get("accept")?.includes("application/json")) {
      return applyNoStoreHeaders(
        NextResponse.json({ status: error ? "operation_failed" : "updated" }, {
          status: error ? 500 : 200,
        }),
      );
    }
    return redirectResult(request, error ? { error: "operation_failed" } : { status: "updated" });
  }
  if (form.get("action") === "delete") {
    const { error } = await service.auth.admin.deleteUser(target.auth_user_id);
    return redirectResult(request, error ? { error: "operation_failed" } : { status: "deleted" });
  }
  const parsed = updateSchema.safeParse({ action: form.get("action"), full_name: form.get("full_name"), email: form.get("email"), password: form.get("password") || undefined, is_active: form.has("is_active") ? form.get("is_active") === "on" : target.is_active });
  if (!parsed.success || (parsed.data.password && parsed.data.password.length < 14)) {
    if (request.headers.get("accept")?.includes("application/json")) {
      const fieldErrors = parsed.success
        ? { password: "A senha precisa ter pelo menos 14 caracteres." }
        : Object.fromEntries(
            parsed.error.issues.map((issue) => [String(issue.path[0]), "Revise este campo."]),
          );

      return applyNoStoreHeaders(
        NextResponse.json(
          { status: "error", message: "Revise os dados informados.", fieldErrors },
          { status: 400 },
        ),
      );
    }
    return redirectResult(request, { error: "invalid_input" });
  }
  const authUpdate = await service.auth.admin.updateUserById(target.auth_user_id, { email: parsed.data.email, ...(parsed.data.password ? { password: parsed.data.password } : {}), user_metadata: { full_name: parsed.data.full_name } });
  if (authUpdate.error) return redirectResult(request, { error: "operation_failed" });
  const { error } = await service.from("users").update({ full_name: parsed.data.full_name, email: parsed.data.email, role: "admin", is_active: parsed.data.is_active }).eq("id", id);
  return redirectResult(request, error ? { error: "operation_failed" } : { status: "updated" });
}
