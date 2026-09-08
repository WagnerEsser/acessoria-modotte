"use client";

import { useRef, useState } from "react";

import { AdminForm } from "@/components/admin/admin-form";

type PublishPageSwitchProps = {
  action: string;
  checked: boolean;
};

export function PublishPageSwitch({ action, checked: initialChecked }: PublishPageSwitchProps) {
  const [checked, setChecked] = useState(initialChecked);
  const previousValue = useRef(initialChecked);

  function handleChange(nextValue: boolean, form: HTMLFormElement | null) {
    previousValue.current = checked;
    setChecked(nextValue);
    form?.requestSubmit();
  }

  return (
    <AdminForm
      action={action}
      className="shrink-0"
      onError={() => setChecked(previousValue.current)}
      refreshOnSuccess={false}
    >
      <input type="hidden" name="action" value="publish" />
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-ivory/65">
        <input
          name="is_published"
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          onChange={(event) => handleChange(event.target.checked, event.currentTarget.form)}
        />
        <span className="relative h-6 w-11 rounded-full bg-brand-ivory/20 transition peer-checked:bg-brand-gold/80 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-gold/70 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
        Publicado
      </label>
    </AdminForm>
  );
}
