"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdminForm } from "@/components/admin/admin-form";

type DeleteUserButtonProps = {
  action: string;
  userName: string;
};

export function DeleteUserButton({
  action,
  userName,
}: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-9 px-0 text-brand-ivory/65 hover:text-red-200"
        onClick={() => setOpen(true)}
        aria-label={`Excluir usuário ${userName}`}
        title="Excluir usuário"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>

      {mounted && open
        ? createPortal(
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/92 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-brand-beige/20 bg-brand-navy p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Confirmar exclusão
                </p>
                <h2 id="delete-user-title" className="mt-2 font-display text-2xl text-brand-ivory">
                  Excluir usuário?
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-9 px-0 text-brand-ivory/65"
                onClick={() => setOpen(false)}
                aria-label="Fechar confirmação"
                title="Fechar"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
              A conta de <strong className="text-brand-ivory">{userName}</strong> será removida
              definitivamente.
            </p>
            <AdminForm
              action={action}
              className="mt-6 flex justify-end gap-3"
              onSuccess={() => setOpen(false)}
            >
              <input type="hidden" name="action" value="delete" />
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton size="sm" variant="gold" pendingLabel="Excluindo...">
                Confirmar exclusão
              </SubmitButton>
            </AdminForm>
          </div>
        </div>
          ,
          document.body,
        )
        : null}
    </>
  );
}
