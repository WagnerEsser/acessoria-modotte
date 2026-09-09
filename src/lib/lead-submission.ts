import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max);

const leadSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: optionalText(254).refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "invalid_email"
    ),
    phone: optionalText(20).refine(
      (value) => !value || /^\d{8,15}$/.test(value),
      "invalid_phone"
    ),
    source: z.string().trim().min(1).max(40).regex(/^[\p{L}\d_-]+$/u),
    pageSlug: optionalText(80).refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "invalid_page_slug"
    ),
    interestType: optionalText(100),
    propertySlug: optionalText(100).refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "invalid_property_slug"
    ),
    propertyContext: optionalText(500),
    message: optionalText(3000),
    website: optionalText(200),
    turnstileToken: optionalText(2048),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "email_or_phone_required",
      });
    }

    if (value.pageSlug === "contato") {
      if (!value.email) {
        context.addIssue({ code: "custom", path: ["email"], message: "required" });
      }
      if (!value.phone) {
        context.addIssue({ code: "custom", path: ["phone"], message: "required" });
      }
      if (!value.interestType) {
        context.addIssue({ code: "custom", path: ["interestType"], message: "required" });
      }
      if (!value.message) {
        context.addIssue({ code: "custom", path: ["message"], message: "required" });
      } else if (value.message.length < 10) {
        context.addIssue({ code: "custom", path: ["message"], message: "min_length" });
      }
    }
  });

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export function parseLeadSubmission(params: URLSearchParams) {
  return leadSubmissionSchema.safeParse({
    name: params.get("name") ?? "",
    email: params.get("email") ?? "",
    phone: (params.get("phone") ?? "").replace(/\D/g, ""),
    source: params.get("source") ?? "site",
    pageSlug: params.get("page_slug") ?? "",
    interestType: params.get("interest_type") ?? "",
    propertySlug: params.get("property_slug") ?? "",
    propertyContext: params.get("property_context") ?? "",
    message: params.get("message") ?? "",
    website: params.get("website") ?? "",
    turnstileToken: params.get("cf-turnstile-response") ?? "",
  });
}
