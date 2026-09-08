import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { PageBlocksEditor, type EditableBlock } from "@/components/admin/page-blocks-editor";
import { PublishPageSwitch } from "@/components/admin/publish-page-switch";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { AdminForm } from "@/components/admin/admin-form";
import { formatBrazilianPhoneDisplayNumber, getWhatsAppDisplayNumber } from "@/lib/contact";
import { formatDateTimeBRL } from "@/lib/formatters";
import { getPublicSiteSettings } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";
import { getVerifiedAdminIdentity } from "@/lib/admin-identity";

export const metadata = buildMetadata({ title: "Conteúdos", description: "Edite os conteúdos públicos da assessoria.", path: "/admin/conteudos", noIndex: true });
export const dynamic = "force-dynamic";

type PageRecord = { id: string; slug: string; title: string; subtitle: string | null; body: string | null; page_type: string; is_published: boolean; updated_at: string };
type PageBlockRecord = { id: string; page_id: string; block_key: string; title: string | null; content: string | null; sort_order: number; is_active: boolean };

function instagramValue(value: string | undefined) { return value?.match(/instagram\.com\/([^/?#]+)/i)?.[1] ?? value?.replace(/^@/, "") ?? ""; }
function pageBlocks(all: PageBlockRecord[], page?: PageRecord | null) { return page ? all.filter((b) => b.page_id === page.id).sort((a, z) => a.sort_order - z.sort_order) : []; }
function editableBlocks(blocks: PageBlockRecord[], predicate?: (block: PageBlockRecord) => boolean): EditableBlock[] { return blocks.filter((b) => predicate ? predicate(b) : true).map((b) => ({ blockKey: b.block_key, title: b.title ?? "", content: b.content ?? "" })); }

const pageDefinitions = [
  { slug: "quero-vender", label: "Quero vender", type: "landing", fallback: "Quero vender seu imóvel" },
  { slug: "contato", label: "Contato", type: "landing", fallback: "Fale com a assessoria" },
  { slug: "imoveis", label: "Imóveis", type: "landing", fallback: "Imóveis" },
  { slug: "blog", label: "Blog", type: "landing", fallback: "Blog" },
  { slug: "areas", label: "Áreas atendidas", type: "landing", fallback: "Áreas atendidas" },
] as const;

function PageEditor({ page, definition }: { page: PageRecord | null; definition: { slug: string; label: string; type: string; fallback: string } }) {
  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /{definition.slug}</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">{definition.label}</h2></div>
        <PublishPageSwitch action={`/api/admin/pages/${definition.slug}`} checked={page?.is_published ?? true} />
      </div>
      <AdminForm id={`form-${definition.slug}`} action={`/api/admin/pages/${definition.slug}`} className="space-y-5">
        <input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value={definition.type} />
        <div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={page?.title ?? definition.fallback} placeholder="Título" required /><Input name="subtitle" defaultValue={page?.subtitle ?? ""} placeholder="Subtítulo" /></div>
        <RichTextEditor name="body" value={page?.body ?? ""} placeholder="Texto principal da página" />
        {definition.slug === "sobre" ? null : null}
        <SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página</SubmitButton>
      </AdminForm>
      {page?.updated_at ? <p className="text-sm text-brand-ivory/60">Última atualização: {formatDateTimeBRL(page.updated_at)}</p> : null}
    </Card>
  );
}

export default async function AdminContentPage() {
  const supabase = await createSupabaseRscClient();
  const identity = await getVerifiedAdminIdentity(supabase);
  if (identity.status !== "authenticated" || identity.identity.role !== "superadmin") redirect("/admin/dashboard");
  const settings = await getPublicSiteSettings();
  const { data: pageRows } = await supabase.from("pages").select("id, slug, title, subtitle, body, page_type, is_published, updated_at").order("updated_at", { ascending: false });
  const pages = (pageRows ?? []) as PageRecord[];
  const ids = pages.map((p) => p.id);
  const { data: blockRows } = ids.length ? await supabase.from("page_blocks").select("id, page_id, block_key, title, content, sort_order, is_active").in("page_id", ids).order("sort_order", { ascending: true }) : { data: [] };
  const blocks = (blockRows ?? []) as PageBlockRecord[];
  const about = pages.find((p) => p.slug === "sobre") ?? null;
  const services = pages.find((p) => p.slug === "servicos") ?? null;
  const aboutPageBlocks = pageBlocks(blocks, about);
  const profile = aboutPageBlocks.find((b) => b.block_key === "about-profile");
  const directions = editableBlocks(aboutPageBlocks, (b) => b.block_key !== "about-profile");
  const serviceBlocks = editableBlocks(pageBlocks(blocks, services));
  return <div className="space-y-8">
    <SectionHeading eyebrow="Conteúdos" title="Conteúdos públicos em edição centralizada" description="Edite os textos exibidos no site e escolha quais páginas aparecem na navegação." />

    <Card className="space-y-5 p-6"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Contato e marca</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Dados principais da assessoria</h2></div>
      <SiteSettingsForm
        action="/api/admin/site-settings"
        email={settings.email ?? ""}
        impactPhrase={settings.impactPhrase}
        instagram={instagramValue(settings.socialLinks.instagram)}
        primaryPhone={settings.primaryPhone ? formatBrazilianPhoneDisplayNumber(settings.primaryPhone) : ""}
        whatsappNumber={settings.whatsappNumber ? getWhatsAppDisplayNumber(settings.whatsappNumber) : ""}
      />
    </Card>

    <Card className="space-y-5 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /sobre</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Sobre</h2></div><PublishPageSwitch action="/api/admin/pages/sobre" checked={about?.is_published ?? true} /></div>
      <AdminForm id="form-sobre" action="/api/admin/pages/sobre" className="space-y-5"><input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value="institutional" /><div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={about?.title ?? "Sobre a assessoria"} placeholder="Título" required /><Input name="subtitle" defaultValue={about?.subtitle ?? ""} placeholder="Subtítulo" /></div><RichTextEditor name="body" value={about?.body ?? ""} placeholder="Texto principal" />
        <div className="rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4"><p className="mb-3 uppercase tracking-[0.28em] text-xs text-brand-beige/55">Perfil da Luana</p><input type="hidden" name="profile_key" value="about-profile" /><Input name="profile_title" defaultValue={profile?.title ?? "Atendimento próximo, leitura técnica e condução direta."} placeholder="Título do perfil" /><RichTextEditor className="mt-4" name="profile_description" value={profile?.content ?? ""} placeholder="Descrição do perfil" /></div>
        <div><p className="mb-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">Direção</p><PageBlocksEditor initialBlocks={directions} label="Direção" addLabel="Adicionar direção" emptyLabel="Nenhum texto de direção será exibido no site." /></div><SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página Sobre</SubmitButton></AdminForm>
    </Card>

    <Card className="space-y-5 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /servicos</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Serviços</h2></div><PublishPageSwitch action="/api/admin/pages/servicos" checked={services?.is_published ?? true} /></div>
      <AdminForm id="form-servicos" action="/api/admin/pages/servicos" className="space-y-5"><input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value="services" /><div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={services?.title ?? "Serviços essenciais"} placeholder="Título" required /><Input name="subtitle" defaultValue={services?.subtitle ?? ""} placeholder="Subtítulo" /></div><RichTextEditor name="body" value={services?.body ?? ""} placeholder="Texto principal" /><PageBlocksEditor initialBlocks={serviceBlocks} label="Serviço" addLabel="Adicionar serviço" emptyLabel="Nenhum serviço será exibido no site." /><SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página Serviços</SubmitButton></AdminForm>
    </Card>

    {pageDefinitions.map((definition) => <PageEditor key={definition.slug} definition={definition} page={pages.find((p) => p.slug === definition.slug) ?? null} />)}
  </div>;
}
