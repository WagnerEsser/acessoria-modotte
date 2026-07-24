import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { PageBlocksEditor, type EditableBlock } from "@/components/admin/page-blocks-editor";
import { formatBrazilianPhoneDisplayNumber, getWhatsAppDisplayNumber } from "@/lib/contact";
import { formatDateTimeBRL } from "@/lib/formatters";
import { getPublicSiteSettings } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({ title: "Conteúdos", description: "Edite os conteúdos públicos da assessoria.", path: "/admin/conteudos", noIndex: true });
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type PageRecord = { id: string; slug: string; title: string; subtitle: string | null; body: string | null; page_type: string; is_published: boolean; updated_at: string };
type PageBlockRecord = { id: string; page_id: string; block_key: string; title: string | null; content: string | null; sort_order: number; is_active: boolean };

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
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

function PublishSwitch({ checked }: { checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-ivory/65">
      <input name="is_published" type="checkbox" defaultChecked={checked} className="size-4 accent-brand-gold" />
      Publicado
    </label>
  );
}

function PageEditor({ page, definition }: { page: PageRecord | null; definition: { slug: string; label: string; type: string; fallback: string } }) {
  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /{definition.slug}</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">{definition.label}</h2><p className="mt-2 text-sm text-brand-ivory/68">Título, textos e publicação desta página.</p></div>
        <Badge variant={page?.is_published ? "gold" : "outline"} className="normal-case tracking-normal">{page?.is_published ? "Publicado" : "Rascunho"}</Badge>
      </div>
      <form action={`/api/admin/pages/${definition.slug}`} method="post" className="space-y-5">
        <input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value={definition.type} />
        <div className="flex justify-end"><PublishSwitch checked={page?.is_published ?? true} /></div>
        <div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={page?.title ?? definition.fallback} placeholder="Título" required /><Input name="subtitle" defaultValue={page?.subtitle ?? ""} placeholder="Subtítulo" /></div>
        <Textarea name="body" rows={6} defaultValue={page?.body ?? ""} placeholder="Texto principal da página" />
        {definition.slug === "sobre" ? null : null}
        <SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página</SubmitButton>
      </form>
      {page?.updated_at ? <p className="text-sm text-brand-ivory/60">Última atualização: {formatDateTimeBRL(page.updated_at)}</p> : null}
    </Card>
  );
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [settings, supabase] = await Promise.all([getPublicSiteSettings(), createSupabaseRscClient()]);
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
  const status = first(params.status);
  const error = first(params.error);

  return <div className="space-y-8">
    <SectionHeading eyebrow="Conteúdos" title="Conteúdos públicos em edição centralizada" description="Edite os textos exibidos no site e escolha quais páginas aparecem na navegação." />
    {status === "updated" ? <Card className="border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">Conteúdo salvo com sucesso.</Card> : null}
    {error ? <Card className="border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">Não foi possível salvar os dados. Revise os campos.</Card> : null}

    <Card className="space-y-5 p-6"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Contato e marca</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Dados principais da assessoria</h2></div>
      <form action="/api/admin/site-settings" method="post" className="space-y-5"><input type="hidden" name="redirect_to" value="/admin/conteudos" />
        <div className="grid gap-4 md:grid-cols-2"><Input name="whatsapp_number" placeholder="WhatsApp" defaultValue={settings.whatsappNumber ? getWhatsAppDisplayNumber(settings.whatsappNumber) : ""} /><Input name="primary_phone" placeholder="Telefone" defaultValue={settings.primaryPhone ? formatBrazilianPhoneDisplayNumber(settings.primaryPhone) : ""} /><Input name="email" type="email" placeholder="E-mail" defaultValue={settings.email ?? ""} /><Input name="instagram" placeholder="Instagram" defaultValue={instagramValue(settings.socialLinks.instagram)} /></div>
        <Textarea name="impact_phrase" rows={3} defaultValue={settings.impactPhrase} placeholder="Frase institucional" />
        <SubmitButton size="lg" pendingLabel="Salvando configurações...">Salvar contato e marca</SubmitButton>
      </form>
    </Card>

    <Card className="space-y-5 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /sobre</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Sobre</h2></div><Badge variant={about?.is_published ? "gold" : "outline"} className="normal-case tracking-normal">{about?.is_published ? "Publicado" : "Rascunho"}</Badge></div>
      <form action="/api/admin/pages/sobre" method="post" className="space-y-5"><input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value="institutional" /><div className="flex justify-end"><PublishSwitch checked={about?.is_published ?? true} /></div><div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={about?.title ?? "Sobre a assessoria"} placeholder="Título" required /><Input name="subtitle" defaultValue={about?.subtitle ?? ""} placeholder="Subtítulo" /></div><Textarea name="body" rows={7} defaultValue={about?.body ?? ""} placeholder="Texto principal" />
        <div className="rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4"><p className="mb-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">Perfil da Luana</p><input type="hidden" name="profile_key" value="about-profile" /><Input name="profile_title" defaultValue={profile?.title ?? "Atendimento próximo, leitura técnica e condução direta."} placeholder="Título do perfil" /><Textarea name="profile_description" rows={4} defaultValue={profile?.content ?? ""} placeholder="Descrição do perfil" /></div>
        <div><p className="mb-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">Direção</p><PageBlocksEditor initialBlocks={directions} label="Direção" addLabel="Adicionar direção" emptyLabel="Nenhum texto de direção será exibido no site." /></div><SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página Sobre</SubmitButton></form>
    </Card>

    <Card className="space-y-5 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página /servicos</p><h2 className="mt-2 font-display text-3xl text-brand-ivory">Serviços</h2></div><Badge variant={services?.is_published ? "gold" : "outline"} className="normal-case tracking-normal">{services?.is_published ? "Publicado" : "Rascunho"}</Badge></div>
      <form action="/api/admin/pages/servicos" method="post" className="space-y-5"><input type="hidden" name="redirect_to" value="/admin/conteudos" /><input type="hidden" name="page_type" value="services" /><div className="flex justify-end"><PublishSwitch checked={services?.is_published ?? true} /></div><div className="grid gap-4 md:grid-cols-2"><Input name="title" defaultValue={services?.title ?? "Serviços essenciais"} placeholder="Título" required /><Input name="subtitle" defaultValue={services?.subtitle ?? ""} placeholder="Subtítulo" /></div><Textarea name="body" rows={6} defaultValue={services?.body ?? ""} placeholder="Texto principal" /><PageBlocksEditor initialBlocks={serviceBlocks} label="Serviço" addLabel="Adicionar serviço" emptyLabel="Nenhum serviço será exibido no site." /><SubmitButton size="lg" pendingLabel="Salvando página...">Salvar página Serviços</SubmitButton></form>
    </Card>

    {pageDefinitions.map((definition) => <PageEditor key={definition.slug} definition={definition} page={pages.find((p) => p.slug === definition.slug) ?? null} />)}
  </div>;
}
