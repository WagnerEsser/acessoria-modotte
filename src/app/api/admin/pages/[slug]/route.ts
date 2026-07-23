import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getAdminFormRequestRejection,
  getAdminRequestContext,
  getRequestOrigin,
} from "@/lib/auth";
import { readFormBoolean, readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";

const EDITABLE_PAGE_DEFAULTS = {
  sobre: {
    title: "Sobre a assessoria",
    pageType: "institutional",
    sortOrder: 10,
  },
  servicos: {
    title: "Serviços essenciais",
    pageType: "services",
    sortOrder: 20,
  },
} as const;

const pageInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().max(320).nullable(),
  body: z.string().trim().max(20_000).nullable(),
  pageType: z.enum(["institutional", "services", "landing"]),
  seoTitle: z.string().trim().max(120).nullable(),
  seoDescription: z.string().trim().max(320).nullable(),
  isPublished: z.boolean(),
});
const pageBlockSchema = z.object({
  block_key: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().max(160).nullable(),
  content: z.string().trim().max(5000).nullable(),
  sort_order: z.number().int().min(0).max(19),
  is_active: z.boolean(),
});

type EditablePageSlug = keyof typeof EDITABLE_PAGE_DEFAULTS;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

type ExistingPageRecord = {
  id: string;
  page_type: string | null;
  hero_image_url: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  sort_order: number | null;
};

function isEditablePageSlug(slug: string): slug is EditablePageSlug {
  return slug in EDITABLE_PAGE_DEFAULTS;
}

function toNullableText(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function parseBlockPayload(formData: FormData) {
  const indexes = new Set<number>();

  for (const key of formData.keys()) {
    const match = /^block_(\d+)_(key|title|content)$/.exec(key);

    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  const candidates = Array.from(indexes)
    .sort((left, right) => left - right)
    .slice(0, 20)
    .map((index) => {
      const blockKey = readFormValue(formData, `block_${index}_key`);
      const title = toNullableText(readFormValue(formData, `block_${index}_title`));
      const content = toNullableText(readFormValue(formData, `block_${index}_content`));

      return {
        block_key: blockKey,
        title,
        content,
        sort_order: index,
        is_active: Boolean(blockKey && (title || content)),
      };
    })
    .filter((block) => block.block_key);

  return z.array(pageBlockSchema).max(20).safeParse(candidates);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const requestOrigin = getRequestOrigin(request);

  const requestRejection = getAdminFormRequestRejection(request);

  if (requestRejection) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: requestRejection.error },
        { status: requestRejection.status }
      )
    );
  }

  const { supabase, applyCookies, isAuthorized } =
    await getAdminRequestContext(request);

  if (!isAuthorized) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl("/admin/conteudos", "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/conteudos"
  );

  if (!isEditablePageSlug(slug)) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=not_found`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const existingPageResult = await supabase
    .from("pages")
    .select("id, page_type, hero_image_url, is_published, seo_title, seo_description, og_image_url, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  const existingPage = (existingPageResult.data as ExistingPageRecord | null) ?? null;
  const defaults = EDITABLE_PAGE_DEFAULTS[slug];
  const title = readFormValue(formData, "title") || defaults.title;
  const subtitle = toNullableText(readFormValue(formData, "subtitle"));
  const body = toNullableText(readFormValue(formData, "body"));
  const pageType =
    readFormValue(formData, "page_type") || existingPage?.page_type || defaults.pageType;
  const seoTitle = toNullableText(readFormValue(formData, "seo_title")) ?? existingPage?.seo_title ?? null;
  const seoDescription =
    toNullableText(readFormValue(formData, "seo_description")) ?? existingPage?.seo_description ?? null;
  const isPublished = readFormBoolean(formData, "is_published");
  const pageInput = pageInputSchema.safeParse({
    title,
    subtitle,
    body,
    pageType,
    seoTitle,
    seoDescription,
    isPublished,
  });
  const blocksResult = parseBlockPayload(formData);

  if (!pageInput.success || !blocksResult.success) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=invalid_data`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const blocks = blocksResult.data;

  const { data: savedPage, error: pageError } = await supabase
    .from("pages")
    .upsert(
      {
        slug,
        title: pageInput.data.title,
        subtitle: pageInput.data.subtitle,
        body: pageInput.data.body,
        page_type: pageInput.data.pageType,
        hero_image_url: existingPage?.hero_image_url ?? null,
        is_published: pageInput.data.isPublished,
        seo_title: pageInput.data.seoTitle,
        seo_description: pageInput.data.seoDescription,
        og_image_url: existingPage?.og_image_url ?? null,
        sort_order: existingPage?.sort_order ?? defaults.sortOrder,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

    if (pageError || !savedPage) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=save_failed`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  if (blocks.length) {
    const { error: blocksError } = await supabase.from("page_blocks").upsert(
      blocks.map((block) => ({
        page_id: savedPage.id,
        block_key: block.block_key,
        title: block.title,
        content: block.content,
        media_url: null,
        sort_order: block.sort_order,
        is_active: block.is_active,
      })),
      { onConflict: "page_id,block_key" }
    );

    if (blocksError) {
      const response = NextResponse.redirect(
        new URL(`${redirectTo}?error=save_failed`, requestOrigin),
        303
      );

      return applyNoStoreHeaders(applyCookies(response));
    }
  }

  const response = NextResponse.redirect(
    new URL(`${redirectTo}?status=updated`, requestOrigin),
    303
  );

  return applyNoStoreHeaders(applyCookies(response));
}
