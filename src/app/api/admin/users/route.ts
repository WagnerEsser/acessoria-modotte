import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyNoStoreHeaders,
  getAdminFormRequestRejection,
  getAdminRequestContext,
  getRequestOrigin,
} from "@/lib/auth";
import { readLimitedUrlEncodedForm } from "@/lib/security/request";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const userSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(14)
    .max(128)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@%&*_-]/),
});

function redirectToUsers(
  request: NextRequest,
  params: Record<string, string>
) {
  const url = new URL("/admin/usuarios", getRequestOrigin(request));

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return applyNoStoreHeaders(NextResponse.redirect(url, 303));
}

export async function POST(request: NextRequest) {
  const rejection = getAdminFormRequestRejection(request);

  if (rejection) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: rejection.error },
        { status: rejection.status }
      )
    );
  }

  const { isAuthorized } = await getAdminRequestContext(request);

  if (!isAuthorized) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "forbidden" }, { status: 403 })
    );
  }

  let form: URLSearchParams;

  try {
    form = await readLimitedUrlEncodedForm(request, 8 * 1024);
  } catch {
    return redirectToUsers(request, { error: "invalid_input" });
  }

  const parsed = userSchema.safeParse({
    full_name: form.get("full_name"),
    email: form.get("email"),
    password: form.get("password"),
  });

  if (!parsed.success) {
    return redirectToUsers(request, { error: "invalid_input" });
  }

  const service = createSupabaseServiceClient();
  const { data, error: createError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
    },
  });

  if (createError || !data.user) {
    const errorCode =
      createError?.status === 422 ? "email_in_use" : "creation_failed";

    return redirectToUsers(request, { error: errorCode });
  }

  const { error: profileError } = await service
    .from("users")
    .upsert(
      {
        auth_user_id: data.user.id,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        role: "admin",
        is_active: true,
      },
      { onConflict: "auth_user_id" }
    );

  if (profileError) {
    await service.auth.admin.deleteUser(data.user.id);

    return redirectToUsers(request, { error: "creation_failed" });
  }

  return redirectToUsers(request, { status: "created" });
}
