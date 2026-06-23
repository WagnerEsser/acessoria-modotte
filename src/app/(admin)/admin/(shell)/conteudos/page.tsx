import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Conteudos",
  description: "Blocos editaveis do site publico.",
  path: "/admin/conteudos",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type PageRecord = {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

export default async function AdminContentPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("pages")
    .select("id, slug, title, page_type, is_published, seo_title, seo_description, updated_at")
    .order("updated_at", { ascending: false });

  const pages = (data ?? []) as PageRecord[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Conteudos"
        title="Home, banners e textos institucionais em um unico lugar"
        description="As paginas abaixo saem da tabela pages e mostram o que esta publicado ou em revisao."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {pages.length ? (
          pages.map((page) => {
            const isSeoComplete = Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim());

            return (
              <Card key={page.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-ivory">{page.title}</p>
                    <p className="text-sm text-brand-ivory/64">
                      {page.page_type} - /{page.slug}
                    </p>
                  </div>
                  <Badge variant={page.is_published ? "gold" : "outline"} className="normal-case tracking-normal">
                    {page.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={isSeoComplete ? "gold" : "outline"} className="normal-case tracking-normal">
                    {isSeoComplete ? "SEO completo" : "SEO pendente"}
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    Atualizado {formatDateTimeBRL(page.updated_at)}
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-6 text-sm text-brand-ivory/68">
            Nenhuma pagina cadastrada ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
