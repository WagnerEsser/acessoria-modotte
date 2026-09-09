import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { AdminForm } from "@/components/admin/admin-form";
import { PropertyImageManager, type ManagedPropertyImage } from "@/components/admin/property-image-manager";
import { PropertyVideoManager, type ManagedPropertyVideo } from "@/components/admin/property-video-manager";
import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

export type PropertyFormValues = {
  title?: string;
  slug?: string;
  transactionType?: string;
  commercialStatus?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  neighborhoodName?: string;
  address?: string;
  showFullAddress?: boolean;
  zipCode?: string;
  price?: string;
  priceOnRequest?: boolean;
  bedrooms?: string;
  bathrooms?: string;
  garages?: string;
  areaTotal?: string;
  areaUseful?: string;
  condominiumFee?: string;
  iptuValue?: string;
  builtYear?: string;
  furnished?: boolean;
  latitude?: string;
  longitude?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  featured?: boolean;
  isPublished?: boolean;
  features?: string;
  seoTitle?: string;
  seoDescription?: string;
  description?: string;
};

type PropertyFormProps = {
  action: string;
  redirectTo: string;
  submitLabel: string;
  values?: PropertyFormValues;
  images?: ManagedPropertyImage[];
  videos?: ManagedPropertyVideo[];
};

function getFieldValue(value: string | undefined) {
  return value ?? "";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="ml-1 block text-[13px] text-brand-ivory/78">{label}</span>
      {children}
    </div>
  );
}

export function PropertyForm({ action, redirectTo, submitLabel, values, images, videos }: PropertyFormProps) {
  const transactionTypeOptions = [
    { value: "sale", label: "Venda", description: "Captação voltada à venda" },
    { value: "rent", label: "Locação", description: "Captação voltada à locação" },
    { value: "both", label: "Venda e locação", description: "Os dois formatos" },
  ];

  return (
    <AdminForm action={action} className="space-y-6">
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Identificação</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Como o imóvel será apresentado</h3></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título do imóvel"><Input name="title" placeholder="Ex.: Apartamento com vista para o mar" defaultValue={getFieldValue(values?.title)} required /></Field>
          <Field label="Slug (opcional)"><Input name="slug" placeholder="Ex.: apartamento-vista-mar" defaultValue={getFieldValue(values?.slug)} /></Field>
          <Select name="transaction_type" label="Tipo de transação" labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78" defaultValue={getFieldValue(values?.transactionType) || "sale"} options={transactionTypeOptions} />
          <Select
            name="commercial_status"
            label="Situação comercial"
            labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78"
            defaultValue={getFieldValue(values?.commercialStatus) || "published"}
            options={[
              { value: "published", label: "Disponível" },
              { value: "reserved", label: "Reservado" },
              { value: "sold", label: "Vendido" },
              { value: "hidden", label: "Oculto" },
            ]}
          />
          <Field label="Tipo do imóvel"><Input name="property_type" placeholder="Ex.: Apartamento, casa ou terreno" defaultValue={getFieldValue(values?.propertyType)} required /></Field>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Localização</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Onde o imóvel está</h3><p className="mt-2 text-sm leading-6 text-brand-ivory/68">O endereço completo só será exibido se você permitir.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cidade"><Input name="city" placeholder="Ex.: Balneário Camboriú" defaultValue={getFieldValue(values?.city)} required /></Field>
          <Field label="Estado"><Input name="state" placeholder="Ex.: SC" defaultValue={getFieldValue(values?.state)} required /></Field>
          <Field label="Bairro"><Input name="neighborhood_name" placeholder="Ex.: Centro" defaultValue={getFieldValue(values?.neighborhoodName)} /></Field>
          <Field label="CEP"><Input name="zip_code" placeholder="Ex.: 88330-000" inputMode="numeric" maxLength={9} defaultValue={getFieldValue(values?.zipCode)} /></Field>
          <Field label="Endereço completo"><Input name="address" placeholder="Ex.: Avenida Brasil, 1000" defaultValue={getFieldValue(values?.address)} /></Field>
          <label className="flex h-11 self-end items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/35 px-4"><input name="show_full_address" type="checkbox" defaultChecked={Boolean(values?.showFullAddress)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-[13px] font-medium text-brand-ivory">Mostrar endereço completo</span><span title="Desmarcado: mostramos apenas a região aproximada." aria-label="Desmarcado: mostramos apenas a região aproximada."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
          <Field label="Latitude (opcional)"><Input name="latitude" placeholder="Ex.: -26.9906" inputMode="decimal" defaultValue={getFieldValue(values?.latitude)} /></Field>
          <Field label="Longitude (opcional)"><Input name="longitude" placeholder="Ex.: -48.6356" inputMode="decimal" defaultValue={getFieldValue(values?.longitude)} /></Field>
        </div>
        <p className="text-xs leading-5 text-brand-ivory/52">Para o mapa, informe coordenadas do ponto exato apenas quando o endereço completo puder ser divulgado.</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Características</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Dados para ajudar na decisão</h3></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Preço"><Input name="price" placeholder="Ex.: 850000" inputMode="decimal" defaultValue={getFieldValue(values?.price)} /></Field>
          <Field label="Área útil"><Input name="area_useful" placeholder="Ex.: 120 m²" inputMode="decimal" defaultValue={getFieldValue(values?.areaUseful)} /></Field>
          <Field label="Área total"><Input name="area_total" placeholder="Ex.: 160 m²" inputMode="decimal" defaultValue={getFieldValue(values?.areaTotal)} /></Field>
          <Field label="Dormitórios"><Input name="bedrooms" placeholder="Ex.: 3" inputMode="numeric" defaultValue={getFieldValue(values?.bedrooms)} /></Field>
          <Field label="Banheiros"><Input name="bathrooms" placeholder="Ex.: 2" inputMode="numeric" defaultValue={getFieldValue(values?.bathrooms)} /></Field>
          <Field label="Vagas de garagem"><Input name="garages" placeholder="Ex.: 2" inputMode="numeric" defaultValue={getFieldValue(values?.garages)} /></Field>
          <Field label="Taxa de condomínio"><Input name="condominium_fee" placeholder="Ex.: 850" inputMode="decimal" defaultValue={getFieldValue(values?.condominiumFee)} /></Field>
          <Field label="IPTU"><Input name="iptu_value" placeholder="Ex.: 1800" inputMode="decimal" defaultValue={getFieldValue(values?.iptuValue)} /></Field>
          <Field label="Ano de construção"><Input name="built_year" placeholder="Ex.: 2020" inputMode="numeric" defaultValue={getFieldValue(values?.builtYear)} /></Field>
          <label className="flex h-11 self-end items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/35 px-4"><input name="furnished" type="checkbox" defaultChecked={Boolean(values?.furnished)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-[13px] font-medium text-brand-ivory">Mobiliado</span><span title="Marque se o imóvel já é entregue com mobília." aria-label="Marque se o imóvel já é entregue com mobília."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        </div>
        <Field label="Características"><Textarea name="features" placeholder={"Uma característica por linha. Ex.:\nPiscina: Sim\nVaranda: Gourmet\nAceita pets"} defaultValue={getFieldValue(values?.features)} className="min-h-[140px]" /></Field>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Atendimento</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Como o interessado pode falar</h3></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Telefone"><Input name="contact_phone" placeholder="(11) 3333-4444" inputMode="tel" defaultValue={getFieldValue(values?.contactPhone)} /></Field><Field label="WhatsApp"><Input name="contact_whatsapp" placeholder="(11) 99999-9999" inputMode="tel" defaultValue={getFieldValue(values?.contactWhatsapp)} /></Field></div>
        <Field label="Descrição principal do imóvel"><Textarea name="description" placeholder="Conte os principais detalhes do imóvel" defaultValue={getFieldValue(values?.description)} /></Field>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Busca e compartilhamento</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Como o imóvel aparece no Google</h3></div>
        <Field label="Título para buscadores (opcional)"><Input name="seo_title" placeholder="Como o imóvel deve aparecer no Google" maxLength={120} defaultValue={getFieldValue(values?.seoTitle)} /></Field>
        <Field label="Descrição para buscadores (opcional)"><Textarea name="seo_description" placeholder="Resumo do imóvel para os resultados de busca" maxLength={320} defaultValue={getFieldValue(values?.seoDescription)} className="min-h-[110px]" /></Field>
      </section>

      <PropertyImageManager initialImages={images} />
      <PropertyVideoManager initialVideos={videos} />

      <section className="grid gap-4 md:grid-cols-3">
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="price_on_request" type="checkbox" defaultChecked={Boolean(values?.priceOnRequest)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-[13px] font-medium text-brand-ivory">Preço sob consulta</span><span title="Oculta o valor no catálogo." aria-label="Oculta o valor no catálogo."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="featured" type="checkbox" defaultChecked={Boolean(values?.featured)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-[13px] font-medium text-brand-ivory">Destaque</span><span title="Leva o imóvel para a frente da vitrine." aria-label="Leva o imóvel para a frente da vitrine."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="is_published" type="checkbox" defaultChecked={Boolean(values?.isPublished)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-[13px] font-medium text-brand-ivory">Publicar imóvel</span><span title="Desmarcado mantém o rascunho." aria-label="Desmarcado mantém o rascunho."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
      </section>

      <div className="flex flex-wrap gap-3"><SubmitButton size="lg" pendingLabel="Salvando imóvel...">{submitLabel}</SubmitButton></div>
    </AdminForm>
  );
}
