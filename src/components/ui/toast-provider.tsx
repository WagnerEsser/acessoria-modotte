"use client";

import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "border-emerald-400/35 bg-emerald-950/90 text-emerald-100" },
  error: { icon: XCircle, className: "border-red-400/35 bg-red-950/90 text-red-100" },
  info: { icon: Info, className: "border-sky-400/35 bg-sky-950/90 text-sky-100" },
  warning: { icon: TriangleAlert, className: "border-amber-400/35 bg-amber-950/90 text-amber-100" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }].slice(-4));
    window.setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-full sm:max-w-md" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const { icon: Icon, className } = toastStyles[toast.type];
          return (
            <div key={toast.id} className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${className}`} role={toast.type === "error" ? "alert" : "status"}>
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
              <button type="button" className="shrink-0 rounded-full p-1 opacity-75 transition hover:bg-white/10 hover:opacity-100" onClick={() => removeToast(toast.id)} aria-label="Fechar aviso" title="Fechar aviso">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
