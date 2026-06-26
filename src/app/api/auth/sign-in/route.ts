import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getRequestOrigin,
  sanitizeAdminRedirect,
} from "@/lib/auth";
import { setDevAdminSession } from "@/lib/dev-auth";
import { getAdminLoginEmail, getAdminLoginPassword } from "@/lib/env";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = readFormValue(formData, "email");
  const password = readFormValue(formData, "password");
  const redirectTo = sanitizeAdminRedirect(readFormValue(formData, "redirectTo"));
  const adminEmail = getAdminLoginEmail();
  const adminPassword = getAdminLoginPassword();
  const requestOrigin = getRequestOrigin(request);

  if (!email || !password) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "missing_credentials"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  if (email !== adminEmail || password !== adminPassword) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "invalid_credentials"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const response = NextResponse.redirect(new URL(redirectTo, requestOrigin), 303);

  setDevAdminSession(response);

  return applyNoStoreHeaders(response);
}
