import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { AdminForm } from "@/components/admin/admin-form";
import { PropertyImageManager, type ManagedPropertyImage } from "@/components/admin/property-image-manager";
import { PropertyVideoManager, type ManagedPropertyVideo } from "@/components/admin/property-video-manager";
import { CircleHelp } from "lucide-react";

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
          <Input name="title" placeholder="Título do imóvel" defaultValue={getFieldValue(values?.title)} required />
          <Input name="slug" placeholder="Slug (opcional)" defaultValue={getFieldValue(values?.slug)} />
          <Select name="transaction_type" label="Tipo de transação" defaultValue={getFieldValue(values?.transactionType) || "sale"} options={transactionTypeOptions} />
          <Select
            name="commercial_status"
            label="Situação comercial"
            defaultValue={getFieldValue(values?.commercialStatus) || "published"}
            options={[
              { value: "published", label: "Disponível" },
              { value: "reserved", label: "Reservado" },
              { value: "sold", label: "Vendido" },
              { value: "hidden", label: "Oculto" },
            ]}
          />
          <Input name="property_type" placeholder="Tipo do imóvel" defaultValue={getFieldValue(values?.propertyType)} required />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Localização</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Onde o imóvel está</h3><p className="mt-2 text-sm leading-6 text-brand-ivory/68">O endereço completo só será exibido se você permitir.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="city" placeholder="Cidade" defaultValue={getFieldValue(values?.city)} required />
          <Input name="state" placeholder="Estado" defaultValue={getFieldValue(values?.state)} required />
          <Input name="neighborhood_name" placeholder="Bairro" defaultValue={getFieldValue(values?.neighborhoodName)} />
          <Input name="zip_code" placeholder="CEP" inputMode="numeric" maxLength={9} defaultValue={getFieldValue(values?.zipCode)} />
          <Input name="address" placeholder="Endereço completo" defaultValue={getFieldValue(values?.address)} />
          <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/35 px-4"><input name="show_full_address" type="checkbox" defaultChecked={Boolean(values?.showFullAddress)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-sm font-medium text-brand-ivory">Mostrar endereço completo</span><span title="Desmarcado: mostramos apenas a região aproximada." aria-label="Desmarcado: mostramos apenas a região aproximada."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
          <Input name="latitude" placeholder="Latitude (opcional)" inputMode="decimal" defaultValue={getFieldValue(values?.latitude)} />
          <Input name="longitude" placeholder="Longitude (opcional)" inputMode="decimal" defaultValue={getFieldValue(values?.longitude)} />
        </div>
        <p className="text-xs leading-5 text-brand-ivory/52">Para o mapa, informe coordenadas do ponto exato apenas quando o endereço completo puder ser divulgado.</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Características</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Dados para ajudar na decisão</h3></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="price" placeholder="Preço" inputMode="decimal" defaultValue={getFieldValue(values?.price)} />
          <Input name="area_useful" placeholder="Área útil em m²" inputMode="decimal" defaultValue={getFieldValue(values?.areaUseful)} />
          <Input name="area_total" placeholder="Área total em m²" inputMode="decimal" defaultValue={getFieldValue(values?.areaTotal)} />
          <Input name="bedrooms" placeholder="Dormitórios" inputMode="numeric" defaultValue={getFieldValue(values?.bedrooms)} />
          <Input name="bathrooms" placeholder="Banheiros" inputMode="numeric" defaultValue={getFieldValue(values?.bathrooms)} />
          <Input name="garages" placeholder="Vagas de garagem" inputMode="numeric" defaultValue={getFieldValue(values?.garages)} />
          <Input name="condominium_fee" placeholder="Taxa de condomínio" inputMode="decimal" defaultValue={getFieldValue(values?.condominiumFee)} />
          <Input name="iptu_value" placeholder="IPTU" inputMode="decimal" defaultValue={getFieldValue(values?.iptuValue)} />
          <Input name="built_year" placeholder="Ano de construção" inputMode="numeric" defaultValue={getFieldValue(values?.builtYear)} />
          <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/35 px-4"><input name="furnished" type="checkbox" defaultChecked={Boolean(values?.furnished)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-sm font-medium text-brand-ivory">Mobiliado</span><span title="Marque se o imóvel já é entregue com mobília." aria-label="Marque se o imóvel já é entregue com mobília."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        </div>
        <Textarea name="features" placeholder={"Características, uma por linha. Ex.:\nPiscina: Sim\nVaranda: Gourmet\nAceita pets"} defaultValue={getFieldValue(values?.features)} className="min-h-[140px]" />
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Atendimento</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Como o interessado pode falar</h3></div>
        <div className="grid gap-4 md:grid-cols-2"><Input name="contact_phone" placeholder="Telefone" inputMode="tel" defaultValue={getFieldValue(values?.contactPhone)} /><Input name="contact_whatsapp" placeholder="WhatsApp" inputMode="tel" defaultValue={getFieldValue(values?.contactWhatsapp)} /></div>
        <Textarea name="description" placeholder="Descrição principal do imóvel" defaultValue={getFieldValue(values?.description)} />
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <div><p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Busca e compartilhamento</p><h3 className="mt-2 font-display text-2xl text-brand-ivory">Como o imóvel aparece no Google</h3></div>
        <Input name="seo_title" placeholder="Título para buscadores (opcional)" maxLength={120} defaultValue={getFieldValue(values?.seoTitle)} />
        <Textarea name="seo_description" placeholder="Descrição para buscadores (opcional)" maxLength={320} defaultValue={getFieldValue(values?.seoDescription)} className="min-h-[110px]" />
      </section>

      <PropertyImageManager initialImages={images} />
      <PropertyVideoManager initialVideos={videos} />

      <section className="grid gap-4 md:grid-cols-3">
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="price_on_request" type="checkbox" defaultChecked={Boolean(values?.priceOnRequest)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-sm font-medium text-brand-ivory">Preço sob consulta</span><span title="Oculta o valor no catálogo." aria-label="Oculta o valor no catálogo."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="featured" type="checkbox" defaultChecked={Boolean(values?.featured)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-sm font-medium text-brand-ivory">Destaque</span><span title="Leva o imóvel para a frente da vitrine." aria-label="Leva o imóvel para a frente da vitrine."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 px-4"><input name="is_published" type="checkbox" defaultChecked={Boolean(values?.isPublished)} className="size-4 shrink-0 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30" /><span className="text-sm font-medium text-brand-ivory">Publicar imóvel</span><span title="Desmarcado mantém o rascunho." aria-label="Desmarcado mantém o rascunho."><CircleHelp aria-hidden="true" className="size-4 text-brand-ivory/55" /></span></label>
      </section>

      <div className="flex flex-wrap gap-3"><SubmitButton size="lg" pendingLabel="Salvando imóvel...">{submitLabel}</SubmitButton></div>
    </AdminForm>
  );
}
