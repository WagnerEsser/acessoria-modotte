import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders, buildAdminLoginUrl, getRequestOrigin } from "@/lib/auth";
import { hasDevAdminSession } from "@/lib/dev-auth";
import { readFormBoolean, readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";
import { createSupabaseServerContext } from "@/lib/supabase/server";

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

  return Array.from(indexes)
    .sort((left, right) => left - right)
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
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/conteudos"
  );
  const requestOrigin = getRequestOrigin(request);

  if (!isEditablePageSlug(slug)) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=not_found`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const hasAccess = hasDevAdminSession(request);

  if (!hasAccess) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
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
  const pageType = readFormValue(formData, "page_type") || existingPage?.page_type || defaults.pageType;
  const seoTitle = toNullableText(readFormValue(formData, "seo_title")) ?? existingPage?.seo_title ?? null;
  const seoDescription =
    toNullableText(readFormValue(formData, "seo_description")) ?? existingPage?.seo_description ?? null;
  const isPublished = readFormBoolean(formData, "is_published");
  const blocks = parseBlockPayload(formData);

  const { data: savedPage, error: pageError } = await supabase
    .from("pages")
    .upsert(
      {
        slug,
        title,
        subtitle,
        body,
        page_type: pageType,
        hero_image_url: existingPage?.hero_image_url ?? null,
        is_published: isPublished,
        seo_title: seoTitle,
        seo_description: seoDescription,
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
