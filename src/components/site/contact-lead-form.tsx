"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { AdminForm } from "@/components/admin/admin-form";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

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

export function ContactLeadForm() {
  const [phone, setPhone] = useState("");

  return (
    <AdminForm
      action="/api/leads"
      className="mt-6 space-y-5"
      onSuccess={(form) => {
        form.reset();
        setPhone("");
      }}
    >
      <input type="hidden" name="redirect_to" value="/contato" />
      <input type="hidden" name="source" value="contato" />
      <input type="hidden" name="page_slug" value="contato" />
      <input type="hidden" name="website" value="" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="name"
          placeholder="Nome"
          autoComplete="name"
          minLength={2}
          maxLength={120}
          required
          title="Informe seu nome."
        />
        <Input
          name="email"
          placeholder="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          required
          title="Informe um e-mail válido."
        />
        <Input
          name="phone"
          placeholder="Telefone (11) 99999-9999"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
          maxLength={15}
          pattern={String.raw`\(\d{2}\) \d{4,5}-\d{4}`}
          required
          title="Informe um telefone com DDD, no formato (11) 99999-9999."
        />
        <Input
          name="interest_type"
          placeholder="Interesse principal"
          defaultValue="Contato geral"
          minLength={2}
          maxLength={100}
          required
          title="Informe seu interesse principal."
        />
        <Textarea
          name="message"
          className="sm:col-span-2"
          placeholder="Conte sua necessidade"
          minLength={10}
          maxLength={3000}
          rows={6}
          required
          title="Descreva sua necessidade com pelo menos 10 caracteres."
        />
      </div>

      <TurnstileWidget />

      <SubmitButton size="lg" pendingLabel="Enviando mensagem...">
        Enviar mensagem
        <ArrowRight className="size-4" />
      </SubmitButton>
    </AdminForm>
  );
}
