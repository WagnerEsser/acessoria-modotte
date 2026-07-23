import { z } from "zod";

const turnstileResponseSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
});

export async function verifyTurnstileToken(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token || token.length > 2048) {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: remoteIp === "unknown" ? undefined : remoteIp,
          idempotency_key: crypto.randomUUID(),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );
    const parsed = turnstileResponseSchema.safeParse(await response.json());

    return (
      response.ok &&
      parsed.success &&
      parsed.data.success &&
      (!parsed.data.action || parsed.data.action === "lead")
    );
  } catch {
    return false;
  }
}
