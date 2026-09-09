import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyNoStoreHeaders,
  getAdminFormRequestRejection,
  getAdminRequestContext,
} from "@/lib/auth";
import { readLimitedUrlEncodedForm } from "@/lib/security/request";

const updateSchema = z.object({
  action: z.literal("update_status"),
  status: z.enum(["new", "read", "qualified", "in_progress", "won", "lost"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejection = getAdminFormRequestRejection(request);

  if (rejection) {
    return applyNoStoreHeaders(
      NextResponse.json({ status: "error", message: "Solicitação inválida." }, { status: rejection.status }),
    );
  }

  const { supabase, isAuthorized } = await getAdminRequestContext(request);

  if (!isAuthorized) {
    return applyNoStoreHeaders(
      NextResponse.json({ status: "error", message: "Sua sessão expirou. Entre novamente." }, { status: 401 }),
    );
  }

  let form: URLSearchParams;

  try {
    form = await readLimitedUrlEncodedForm(request, 8 * 1024);
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json({ status: "error", message: "Revise os dados informados." }, { status: 400 }),
    );
  }

  const { id } = await params;

  if (form.get("action") === "delete") {
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      return applyNoStoreHeaders(
        NextResponse.json({ status: "error", message: "Não foi possível excluir o lead." }, { status: 500 }),
      );
    }

    return applyNoStoreHeaders(
      NextResponse.json({ status: "success", message: "Lead excluído com sucesso." }),
    );
  }

  const parsed = updateSchema.safeParse({
    action: form.get("action"),
    status: form.get("status"),
  });

  if (!parsed.success) {
    return applyNoStoreHeaders(
      NextResponse.json({ status: "error", message: "Revise o status informado." }, { status: 400 }),
    );
  }

  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return applyNoStoreHeaders(
      NextResponse.json({ status: "error", message: "Não foi possível atualizar o lead." }, { status: 500 }),
    );
  }

  return applyNoStoreHeaders(
    NextResponse.json({ status: "success", message: "Status do lead atualizado." }),
  );
}
