import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export type PropertyFormValues = {
  title?: string;
  slug?: string;
  transactionType?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  neighborhoodName?: string;
  address?: string;
  zipCode?: string;
  price?: string;
  priceOnRequest?: boolean;
  bedrooms?: string;
  bathrooms?: string;
  garages?: string;
  areaTotal?: string;
  areaUseful?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  featured?: boolean;
  isPublished?: boolean;
  description?: string;
};

type PropertyFormProps = {
  action: string;
  redirectTo: string;
  submitLabel: string;
  title: string;
  description: string;
  values?: PropertyFormValues;
};

function getFieldValue(value: string | undefined) {
  return value ?? "";
}

export function PropertyForm({
  action,
  redirectTo,
  submitLabel,
  title,
  description,
  values,
}: PropertyFormProps) {
  const transactionTypeOptions = [
    { value: "sale", label: "Venda", description: "Captação voltada à venda" },
    { value: "rent", label: "Locação", description: "Captação voltada à locação" },
    { value: "both", label: "Venda e locação", description: "Os dois formatos" },
  ];

  return (
    <form action={action} method="post" className="space-y-6">
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <div className="rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Base</p>
        <h2 className="mt-2 font-display text-3xl text-brand-ivory">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" placeholder="Título do imóvel" defaultValue={getFieldValue(values?.title)} required />
        <Input name="slug" placeholder="Slug (opcional)" defaultValue={getFieldValue(values?.slug)} />
        <Select
          name="transaction_type"
          label="Tipo de transação"
          defaultValue={getFieldValue(values?.transactionType) || "sale"}
          options={transactionTypeOptions}
        />
        <Input
          name="property_type"
          placeholder="Tipo do imóvel"
          defaultValue={getFieldValue(values?.propertyType)}
          required
        />
        <Input name="city" placeholder="Cidade" defaultValue={getFieldValue(values?.city)} required />
        <Input name="state" placeholder="Estado" defaultValue={getFieldValue(values?.state)} required />
        <Input
          name="neighborhood_name"
          placeholder="Bairro"
          defaultValue={getFieldValue(values?.neighborhoodName)}
        />
        <Input name="address" placeholder="Endereço" defaultValue={getFieldValue(values?.address)} />
        <Input name="zip_code" placeholder="CEP" defaultValue={getFieldValue(values?.zipCode)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="price" placeholder="Preço" defaultValue={getFieldValue(values?.price)} />
        <Input
          name="area_useful"
          placeholder="Área útil"
          defaultValue={getFieldValue(values?.areaUseful)}
        />
        <Input
          name="area_total"
          placeholder="Área total"
          defaultValue={getFieldValue(values?.areaTotal)}
        />
        <Input
          name="bedrooms"
          placeholder="Dormitórios"
          inputMode="numeric"
          defaultValue={getFieldValue(values?.bedrooms)}
        />
        <Input
          name="bathrooms"
          placeholder="Banheiros"
          inputMode="numeric"
          defaultValue={getFieldValue(values?.bathrooms)}
        />
        <Input
          name="garages"
          placeholder="Vagas"
          inputMode="numeric"
          defaultValue={getFieldValue(values?.garages)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="contact_phone"
          placeholder="+55 47 99999-9999"
          inputMode="tel"
          defaultValue={getFieldValue(values?.contactPhone)}
        />
        <Input
          name="contact_whatsapp"
          placeholder="+55 47 99999-9999"
          inputMode="tel"
          defaultValue={getFieldValue(values?.contactWhatsapp)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
          <input
            name="price_on_request"
            type="checkbox"
            defaultChecked={Boolean(values?.priceOnRequest)}
            className="mt-1 size-4 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30"
          />
          <span>
            <span className="block text-sm font-medium text-brand-ivory">Preço sob consulta</span>
            <span className="block text-sm leading-6 text-brand-ivory/64">
              Use quando o valor não deve aparecer no catálogo.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={Boolean(values?.featured)}
            className="mt-1 size-4 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30"
          />
          <span>
            <span className="block text-sm font-medium text-brand-ivory">Destaque</span>
            <span className="block text-sm leading-6 text-brand-ivory/64">
              Faz o imóvel aparecer primeiro na vitrine e no catálogo.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 md:col-span-2">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={Boolean(values?.isPublished)}
            className="mt-1 size-4 rounded border-brand-beige/30 bg-brand-navy/60 text-brand-gold focus:ring-brand-gold/30"
          />
          <span>
            <span className="block text-sm font-medium text-brand-ivory">Publicar imóvel</span>
            <span className="block text-sm leading-6 text-brand-ivory/64">
              Se desmarcado, o registro fica salvo como rascunho.
            </span>
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-brand-ivory/78">Descrição</span>
        <Textarea
          name="description"
          placeholder="Descrição principal do imóvel"
          defaultValue={getFieldValue(values?.description)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton size="lg" pendingLabel="Salvando imóvel...">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
