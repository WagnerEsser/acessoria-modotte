import type { NextRequest, NextResponse } from "next/server";

export const DEV_ADMIN_SESSION_COOKIE = "lm-dev-admin-session";

export function hasDevAdminSession(request: Pick<NextRequest, "cookies">) {
  return request.cookies.get(DEV_ADMIN_SESSION_COOKIE)?.value === "1";
}

export function setDevAdminSession(response: NextResponse) {
  response.cookies.set(DEV_ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearDevAdminSession(response: NextResponse) {
  response.cookies.set(DEV_ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
