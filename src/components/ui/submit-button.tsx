"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync, useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = Omit<ButtonProps, "children" | "type"> & {
  children: ReactNode;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Processando...",
  disabled,
  ...props
}: SubmitButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [nativeSubmissionPending, setNativeSubmissionPending] = useState(false);
  const { pending: actionPending } = useFormStatus();
  const pending = nativeSubmissionPending || actionPending;
  const isDisabled = Boolean(disabled || pending);

  useEffect(() => {
    const form = buttonRef.current?.form;

    if (!form) {
      return;
    }

    function handleSubmit() {
      flushSync(() => {
        setNativeSubmissionPending(true);
      });
    }

    function handlePageShow() {
      setNativeSubmissionPending(false);
    }

    form.addEventListener("submit", handleSubmit);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      form.removeEventListener("submit", handleSubmit);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <Button
      {...props}
      ref={buttonRef}
      type="submit"
      disabled={isDisabled}
      aria-busy={pending || undefined}
      aria-disabled={isDisabled || undefined}
      data-loading={pending ? "true" : undefined}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
