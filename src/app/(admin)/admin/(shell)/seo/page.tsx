import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { seoChecklist } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "SEO",
  description: "Checklist de SEO e indexacao para o site da assessoria.",
  path: "/admin/seo",
  noIndex: true,
});

export default function AdminSeoPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="SEO"
        title="Indexacao, titles e sinalizacao local"
        description="Este painel guarda o checkup minimo para o site aparecer bem nas buscas."
      />

      <Card className="p-6">
        <Badge variant="gold">Checklist</Badge>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-brand-ivory/72">
          {seoChecklist.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-2 rounded-full bg-brand-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
