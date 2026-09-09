"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { AdminFormPendingContext } from "@/components/admin/admin-form-context";
import { useToast } from "@/components/ui/toast-provider";

type AdminFormProps = {
  action: string;
  children: ReactNode;
  className?: string;
  id?: string;
  onError?: () => void;
  onSuccess?: (form: HTMLFormElement) => void;
  refreshOnSuccess?: boolean;
};

export function AdminForm({
  action,
  children,
  className,
  id,
  onError,
  onSuccess,
  refreshOnSuccess = true,
}: AdminFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    form.querySelectorAll("[data-field-error]").forEach((element) => element.remove());
    form.querySelectorAll("[aria-invalid='true']").forEach((element) => {
      element.removeAttribute("aria-invalid");
      element.classList.remove("border-red-400/70", "focus:border-red-400");
    });

    for (const [name, message] of Object.entries(fieldErrors)) {
      const field = form.elements.namedItem(name);

      if (!(field instanceof HTMLElement)) {
        continue;
      }

      field.setAttribute("aria-invalid", "true");
      field.classList.add("border-red-400/70", "focus:border-red-400");
      const error = document.createElement("p");
      error.dataset.fieldError = "true";
      error.className = "mt-2 text-xs leading-5 text-red-200";
      error.setAttribute("role", "alert");
      error.textContent = message;
      field.insertAdjacentElement("afterend", error);
    }

    return () => {
      form.querySelectorAll("[data-field-error]").forEach((element) => element.remove());
    };
  }, [fieldErrors]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFieldErrors({});

    try {
      const form = event.currentTarget;

      // Read rich text directly from the editor so the submitted value cannot lag behind the visible content.
      form.querySelectorAll<HTMLElement>("[data-rich-text-name]").forEach((editor) => {
        const name = editor.dataset.richTextName;
        const field = name ? Array.from(form.elements).find((element) => element.getAttribute("name") === name) : null;

        if (field instanceof HTMLInputElement) {
          field.value = editor.innerHTML;
        }
      });

      const body = new FormData(form);

      const response = await fetch(action, {
        method: "POST",
        body,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        redirect: "follow",
      });

      const payload = await response.json().catch(() => null) as {
        message?: string;
        redirect?: string;
        status?: string;
        fieldErrors?: Record<string, string>;
      } | null;

      if (!response.ok || payload?.status === "error") {
        setFieldErrors(payload?.fieldErrors ?? {});
        showToast("error", payload?.message ?? "Não foi possível concluir a operação.");
        onError?.();
        setPending(false);
        return;
      }

      showToast("success", payload?.message ?? "Alterações salvas com sucesso.");
      onSuccess?.(form);
      setPending(false);

      if (payload?.redirect) {
        router.replace(payload.redirect);
      } else if (refreshOnSuccess) {
        router.refresh();
      }
    } catch {
      showToast("error", "Não foi possível concluir a operação. Revise os campos e tente novamente.");
      onError?.();
      setPending(false);
    }
  }

  return (
    <AdminFormPendingContext.Provider value={{ fieldErrors, pending }}>
      <form
        ref={formRef}
        id={id}
        action={action}
        method="post"
        className={className}
        data-async-submit="true"
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </AdminFormPendingContext.Provider>
  );
}
