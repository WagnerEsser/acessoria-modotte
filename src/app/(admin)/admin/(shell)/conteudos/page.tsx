import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { contentBlocks } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Conteudos",
  description: "Blocos editaveis do site publico.",
  path: "/admin/conteudos",
  noIndex: true,
});

export default function AdminContentPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Conteudos"
        title="Home, banners e textos institucionais prontos para edição"
        description="A camada de conteudo e independente das paginas, facilitando atualizacao sem mexer no layout."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {contentBlocks.map((block) => (
          <Card key={block.name} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-brand-ivory">{block.name}</p>
                <p className="text-sm text-brand-ivory/64">Atualizado {block.updatedAt}</p>
              </div>
              <Badge variant="outline" className="normal-case tracking-normal">
                {block.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
