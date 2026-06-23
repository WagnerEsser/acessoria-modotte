import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "SEO",
  description: "Checklist de SEO e indexação para o site da assessoria.",
  path: "/admin/seo",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type SeoPageRecord = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

export default async function AdminSeoPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("pages")
    .select("id, title, slug, is_published, seo_title, seo_description, updated_at")
    .order("updated_at", { ascending: false });

  const pages = (data ?? []) as SeoPageRecord[];
  const publishedPages = pages.filter((page) => page.is_published);
  const seoCompletePages = publishedPages.filter(
    (page) => Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim())
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="SEO"
        title="Indexação, titles e sinalização local"
        description="A leitura agora vem das páginas reais cadastradas no banco."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            Publicadas
          </p>
          <div className="mt-3 font-display text-3xl text-brand-ivory">
            {publishedPages.length}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            SEO completo
          </p>
          <div className="mt-3 font-display text-3xl text-brand-ivory">
            {seoCompletePages.length}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            SEO pendente
          </p>
          <div className="mt-3 font-display text-3xl text-brand-ivory">
            {Math.max(publishedPages.length - seoCompletePages.length, 0)}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="gold">Páginas monitoradas</Badge>
          <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            Total {pages.length}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {pages.length ? (
            pages.map((page) => {
              const isSeoComplete =
                Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim());

              return (
                <div
                  key={page.id}
                  className="flex flex-col gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-brand-ivory">{page.title}</p>
                    <p className="text-sm text-brand-ivory/64">/{page.slug}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={isSeoComplete ? "gold" : "outline"} className="normal-case tracking-normal">
                      {isSeoComplete ? "SEO completo" : "SEO pendente"}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                      Atualizado {formatDateTimeBRL(page.updated_at)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
              Nenhuma página cadastrada ainda.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
