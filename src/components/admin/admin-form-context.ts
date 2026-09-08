"use client";

import { createContext, useContext } from "react";

export type AdminFormState = {
  fieldErrors: Record<string, string>;
  pending: boolean;
};

export const AdminFormPendingContext = createContext<AdminFormState>({
  fieldErrors: {},
  pending: false,
});

export function useAdminFormPending() {
  return useContext(AdminFormPendingContext).pending;
}

export function useAdminFormFieldError(name: string) {
  return useContext(AdminFormPendingContext).fieldErrors[name];
}
