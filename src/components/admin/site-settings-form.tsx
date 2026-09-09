"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdminForm } from "@/components/admin/admin-form";

type SiteSettingsFormProps = {
  action: string;
  email: string;
  impactPhrase: string;
  instagram: string;
  primaryPhone: string;
  whatsappNumber: string;
};

function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  const subscriberLength = digits.length > 10 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 2 + subscriberLength)}-${digits.slice(2 + subscriberLength)}`;
}

function phonePattern(value: string) {
  return value ? "\\(\\d{2}\\) \\d{4,5}-\\d{4}" : undefined;
}

export function SiteSettingsForm({
  action,
  email: initialEmail,
  impactPhrase: initialImpactPhrase,
  instagram: initialInstagram,
  primaryPhone: initialPrimaryPhone,
  whatsappNumber: initialWhatsappNumber,
}: SiteSettingsFormProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(
    formatPhoneInput(initialWhatsappNumber),
  );
  const [primaryPhone, setPrimaryPhone] = useState(
    formatPhoneInput(initialPrimaryPhone),
  );

  return (
    <AdminForm action={action} className="space-y-5">
      <input type="hidden" name="redirect_to" value="/admin/conteudos" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="ml-1 block text-[13px] text-brand-ivory/78">WhatsApp</span>
          <Input
            name="whatsapp_number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(formatPhoneInput(event.target.value))}
            maxLength={15}
            pattern={phonePattern(whatsappNumber)}
            title="Informe um WhatsApp com DDD, no formato (11) 99999-9999."
          />
        </label>
        <label className="block space-y-2">
          <span className="ml-1 block text-[13px] text-brand-ivory/78">Telefone</span>
          <Input
            name="primary_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 3333-4444"
            value={primaryPhone}
            onChange={(event) => setPrimaryPhone(formatPhoneInput(event.target.value))}
            maxLength={15}
            pattern={phonePattern(primaryPhone)}
            title="Informe um telefone com DDD, no formato (11) 3333-4444."
          />
        </label>
        <label className="block space-y-2">
          <span className="ml-1 block text-[13px] text-brand-ivory/78">E-mail</span>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="contato@exemplo.com"
            defaultValue={initialEmail}
            maxLength={254}
            title="Informe um e-mail válido."
          />
        </label>
        <label className="block space-y-2">
          <span className="ml-1 block text-[13px] text-brand-ivory/78">Instagram</span>
          <Input
            name="instagram"
            placeholder="@usuario"
            defaultValue={initialInstagram}
            maxLength={200}
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="ml-1 block text-[13px] text-brand-ivory/78">Frase institucional</span>
        <textarea
          name="impact_phrase"
          rows={3}
          defaultValue={initialImpactPhrase}
          placeholder="Frase institucional"
          minLength={2}
          maxLength={500}
          required
          className="min-h-[160px] w-full rounded-2xl border border-brand-beige/18 bg-brand-navy/55 px-4 py-3 text-sm text-brand-ivory placeholder:text-brand-ivory/42 shadow-sm outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20"
        />
      </label>
      <SubmitButton size="lg" pendingLabel="Salvando configurações...">
        Salvar contato e marca
      </SubmitButton>
    </AdminForm>
  );
}
