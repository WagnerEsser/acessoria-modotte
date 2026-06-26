import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders, getRequestOrigin } from "@/lib/auth";
import { clearDevAdminSession } from "@/lib/dev-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", getRequestOrigin(request)), 303);
  clearDevAdminSession(response);

  return applyNoStoreHeaders(response);
}
