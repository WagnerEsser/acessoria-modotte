import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getAdminFormRequestRejection,
  getAdminRequestContext,
  getRequestOrigin,
} from "@/lib/auth";
import { readFormBoolean, readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";
import { isCurrentSuperAdmin } from "@/lib/admin-authorization";
import { sanitizeRichText } from "@/lib/rich-text";

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
  "quero-vender": { title: "Quero vender seu imóvel", pageType: "landing", sortOrder: 30 },
  contato: { title: "Fale com a assessoria", pageType: "landing", sortOrder: 40 },
  imoveis: { title: "Imóveis", pageType: "landing", sortOrder: 50 },
  areas: { title: "Áreas atendidas", pageType: "landing", sortOrder: 60 },
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

function toNullableRichText(value: string) {
  const sanitized = sanitizeRichText(value);

  return sanitized || null;
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
    .slice(0, 50)
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

  return z.array(pageBlockSchema.extend({ sort_order: z.number().int().min(0).max(49) })).max(50).safeParse(candidates);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const requestOrigin = getRequestOrigin(request);
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

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

  if (!isAuthorized || !(await isCurrentSuperAdmin(supabase))) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Sua sessão expirou. Entre novamente." }, { status: 401 }));
    }
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl("/admin/conteudos", "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const formData = await request.formData();
  const action = readFormValue(formData, "action");
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/conteudos"
  );

  if (!isEditablePageSlug(slug)) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Página não encontrada." }, { status: 404 }));
    }
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=not_found`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  if (action === "publish") {
    const isPublished = readFormBoolean(formData, "is_published");
    const { data: updatedPage, error: publishError } = await supabase
      .from("pages")
      .upsert(
        {
          slug,
          title: EDITABLE_PAGE_DEFAULTS[slug].title,
          page_type: EDITABLE_PAGE_DEFAULTS[slug].pageType,
          is_published: isPublished,
          sort_order: EDITABLE_PAGE_DEFAULTS[slug].sortOrder,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .maybeSingle();

    if (publishError || !updatedPage) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { status: "error", message: "Não foi possível atualizar a publicação da página." },
          { status: 500 },
        ),
      );
    }

    if (slug === "areas") {
      await supabase
        .from("site_settings")
        .update({ show_areas_navigation: isPublished })
        .eq("singleton_key", "main");
    }

    for (const path of ["/", "/sobre", "/servicos", "/quero-vender", "/contato", "/imoveis", "/areas", "/sitemap.xml"]) revalidatePath(path);

    return applyNoStoreHeaders(
      NextResponse.json({
        status: "success",
        message: isPublished ? "Página publicada com sucesso." : "Página retirada da publicação.",
      }),
    );
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
  const body = ["imoveis", "areas"].includes(slug)
    ? null
    : toNullableRichText(readFormValue(formData, "body"));
  const pageType =
    readFormValue(formData, "page_type") || existingPage?.page_type || defaults.pageType;
  const seoTitle = toNullableText(readFormValue(formData, "seo_title")) ?? existingPage?.seo_title ?? null;
  const seoDescription =
    toNullableText(readFormValue(formData, "seo_description")) ?? existingPage?.seo_description ?? null;
  const isPublished = formData.has("is_published")
    ? readFormBoolean(formData, "is_published")
    : existingPage?.is_published ?? true;
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
    if (wantsJson) {
      const fieldErrors: Record<string, string> = {};
      const pageFieldNames: Record<string, string> = {
        title: "title",
        subtitle: "subtitle",
        body: "body",
        pageType: "page_type",
        seoTitle: "seo_title",
        seoDescription: "seo_description",
      };

      if (!pageInput.success) {
        for (const issue of pageInput.error.issues) {
          const field = pageFieldNames[String(issue.path[0])];
          if (field && !fieldErrors[field]) fieldErrors[field] = "Revise este campo.";
        }
      }

      if (!blocksResult.success) {
        for (const issue of blocksResult.error.issues) {
          const [index, field] = issue.path;
          if (typeof index === "number" && typeof field === "string") {
            fieldErrors[`block_${index}_${field}`] = "Revise este campo.";
          }
        }
      }

      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Revise os campos antes de salvar.", fieldErrors }, { status: 400 }));
    }
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=invalid_data`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const blocks = blocksResult.data;
  const profileTitle = toNullableText(readFormValue(formData, "profile_title"))?.slice(0, 160) ?? null;
  const profileDescription = toNullableRichText(readFormValue(formData, "profile_description"))?.slice(0, 5000) ?? null;
  const sellCardText = slug === "quero-vender"
    ? toNullableText(readFormValue(formData, "sell_card_text"))?.slice(0, 5000) ?? null
    : null;
  const submittedBlocks = slug === "sobre"
    ? [{ block_key: "about-profile", title: profileTitle, content: profileDescription, sort_order: 0, is_active: Boolean(profileTitle || profileDescription) }, ...blocks.map((block, index) => ({ ...block, sort_order: index + 1 }))]
    : slug === "quero-vender"
      ? sellCardText
        ? [{ block_key: "sell-card-text", title: null, content: sellCardText, sort_order: 0, is_active: true }]
        : []
      : blocks;

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
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Não foi possível salvar o conteúdo." }, { status: 500 }));
    }
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=save_failed`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const { error: clearBlocksError } = await supabase.from("page_blocks").delete().eq("page_id", savedPage.id);
  if (clearBlocksError) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Não foi possível salvar os blocos de conteúdo." }, { status: 500 }));
    }
    const response = NextResponse.redirect(new URL(`${redirectTo}?error=save_failed`, requestOrigin), 303);
    return applyNoStoreHeaders(applyCookies(response));
  }

  if (submittedBlocks.length) {
    const { error: blocksError } = await supabase.from("page_blocks").insert(
      submittedBlocks.map((block) => ({
        page_id: savedPage.id,
        block_key: block.block_key,
        title: block.title,
        content: block.content,
        media_url: null,
        sort_order: block.sort_order,
        is_active: block.is_active,
      })),
    );

    if (blocksError) {
      if (wantsJson) {
        return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Não foi possível salvar os blocos de conteúdo." }, { status: 500 }));
      }
      const response = NextResponse.redirect(
        new URL(`${redirectTo}?error=save_failed`, requestOrigin),
        303
      );

      return applyNoStoreHeaders(applyCookies(response));
    }
  }

  if (slug === "areas") {
    await supabase.from("site_settings").update({
      show_areas_navigation: pageInput.data.isPublished,
    }).eq("singleton_key", "main");
  }
  for (const path of ["/", "/sobre", "/servicos", "/quero-vender", "/contato", "/imoveis", "/areas", "/sitemap.xml"]) revalidatePath(path);

  const response = NextResponse.redirect(
    new URL(`${redirectTo}?status=updated`, requestOrigin),
    303
  );

  if (wantsJson) {
    return applyNoStoreHeaders(NextResponse.json({ status: "success", message: "Conteúdo salvo com sucesso." }));
  }

  return applyNoStoreHeaders(applyCookies(response));
}
