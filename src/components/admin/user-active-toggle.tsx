"use client";

import { useState } from "react";

type UserActiveToggleProps = {
  action: string;
  isActive: boolean;
};

export function UserActiveToggle({
  action,
  isActive,
}: UserActiveToggleProps) {
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleChange(nextActive: boolean) {
    const previousActive = active;
    setActive(nextActive);
    setPending(true);
    setError(false);

    try {
      const response = await fetch(action, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "same-origin",
        body: new URLSearchParams({
          action: "toggle_active",
          is_active: nextActive ? "on" : "",
        }),
      });

      if (!response.ok) {
        throw new Error("toggle_failed");
      }
    } catch {
      setActive(previousActive);
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className="relative inline-flex cursor-pointer items-center"
        title={active ? "Desativar acesso" : "Ativar acesso"}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={active}
          disabled={pending}
          onChange={(event) => handleChange(event.currentTarget.checked)}
          aria-label={active ? "Desativar acesso" : "Ativar acesso"}
        />
        <span className="h-6 w-11 rounded-full bg-brand-ivory/20 transition peer-checked:bg-brand-gold/80 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-gold/70 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      </label>
      <span className="text-xs text-brand-ivory/65" aria-live="polite">
        {error ? "Erro ao salvar" : active ? "Ativo" : "Inativo"}
      </span>
    </div>
  );
}
