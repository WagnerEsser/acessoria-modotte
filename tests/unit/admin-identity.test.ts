import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { getVerifiedAdminIdentity } from "@/lib/admin-identity";

type ClientOptions = {
  user?: { id: string; email?: string | null } | null;
  userError?: Error | null;
  profile?: {
    full_name: string;
    email: string | null;
    role: string;
    is_active: boolean;
  } | null;
  profileError?: Error | null;
};

function createClient(options: ClientOptions = {}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.profile ?? null,
    error: options.profileError ?? null,
  });
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle,
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  const getUser = vi.fn().mockResolvedValue({
    data: { user: options.user ?? null },
    error: options.userError ?? null,
  });
  const from = vi.fn().mockReturnValue(query);
  const client = {
    auth: { getUser },
    from,
  } as unknown as SupabaseClient;

  return { client, from, getUser, query };
}

describe("verified admin identity", () => {
  it("fails closed without a verified Supabase user", async () => {
    const { client, from, getUser } = createClient({
      user: null,
      userError: new Error("invalid session"),
    });

    await expect(getVerifiedAdminIdentity(client)).resolves.toEqual({
      status: "anonymous",
    });
    expect(getUser).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
  });

  it.each([
    { role: "editor", is_active: true },
    { role: "admin", is_active: false },
  ])("rejects a profile that is not an active admin", async (profileState) => {
    const { client } = createClient({
      user: { id: "auth-user", email: "admin@example.com" },
      profile: {
        full_name: "Maria Gestora",
        email: "profile@example.com",
        ...profileState,
      },
    });

    await expect(getVerifiedAdminIdentity(client)).resolves.toEqual({
      status: "unauthorized",
    });
  });

  it("returns only the verified user's display name and e-mail", async () => {
    const { client, from, query } = createClient({
      user: { id: "auth-user", email: "admin@example.com" },
      profile: {
        full_name: " Maria Gestora ",
        email: "profile@example.com",
        role: "admin",
        is_active: true,
      },
    });

    await expect(getVerifiedAdminIdentity(client)).resolves.toEqual({
      status: "authenticated",
      identity: {
        name: "Maria Gestora",
        email: "admin@example.com",
      },
    });
    expect(from).toHaveBeenCalledWith("users");
    expect(query.select).toHaveBeenCalledWith(
      "full_name, email, role, is_active",
    );
    expect(query.eq).toHaveBeenCalledWith("auth_user_id", "auth-user");
  });
});
