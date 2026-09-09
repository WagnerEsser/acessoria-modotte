"use client";

import { createPortal } from "react-dom";
import { ChevronDown, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { leadStatusOptions, getLeadStatusLabel } from "@/lib/lead-status";

export type AdminLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  interestType: string;
  status: string;
  message: string | null;
  createdAt: string;
  formattedPhone: string | null;
  formattedDate: string;
};

const statusFilterOptions = [
  { value: "all", label: "Todos os leads" },
  ...leadStatusOptions,
];

export function LeadList({ initialLeads }: { initialLeads: AdminLead[] }) {
  const { showToast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingLead, setDeletingLead] = useState<AdminLead | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const filteredLeads = useMemo(
    () => (filter === "all" ? leads : leads.filter((lead) => lead.status === filter)),
    [filter, leads],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(
    () => filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredLeads, pageSize],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function updateStatus(id: string, status: string, automatic = false) {
    if (updatingId === id) {
      return;
    }

    const lead = leads.find((item) => item.id === id);

    if (!lead || lead.status === status) {
      return;
    }

    const previousStatus = lead.status;
    setUpdatingId(id);
    setLeads((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

    try {
      const body = new URLSearchParams({ action: "update_status", status });
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "POST",
        body,
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });
      const payload = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível atualizar o lead.");
      }

      showToast("success", automatic ? "Lead marcado como lido." : "Status do lead atualizado.");
    } catch (error) {
      setLeads((current) => current.map((item) => (item.id === id ? { ...item, status: previousStatus } : item)));
      showToast("error", error instanceof Error ? error.message : "Não foi possível atualizar o lead.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteLead() {
    if (!deletingLead || deletePending) {
      return;
    }

    setDeletePending(true);

    try {
      const response = await fetch(`/api/admin/leads/${deletingLead.id}`, {
        method: "POST",
        body: new URLSearchParams({ action: "delete" }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });
      const payload = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível excluir o lead.");
      }

      setLeads((current) => current.filter((lead) => lead.id !== deletingLead.id));
      showToast("success", "Lead excluído com sucesso.");
      setDeletingLead(null);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Não foi possível excluir o lead.");
    } finally {
      setDeletePending(false);
    }
  }

  useEffect(() => {
    const targetId = window.location.hash.slice(1);

    if (!targetId.startsWith("lead-")) {
      return;
    }

    const details = document.getElementById(targetId);

    if (details instanceof HTMLDetailsElement) {
      details.open = true;
      details.scrollIntoView({ block: "center" });
    }
  }, []);

  function handleToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    const details = event.currentTarget;

    if (details.open) {
      const id = details.dataset.leadId;
      const lead = leads.find((item) => item.id === id);

      if (id && lead?.status === "new") {
        void updateStatus(id, "read", true);
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="max-w-xs">
        <Select
          name="lead_status_filter"
          label="Filtrar por status"
          options={statusFilterOptions}
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setCurrentPage(1);
          }}
        />
      </div>

      {paginatedLeads.length ? (
        <div className="grid gap-4">
          {paginatedLeads.map((lead) => (
            <details
              key={lead.id}
              id={`lead-${lead.id}`}
              data-lead-id={lead.id}
              onToggle={handleToggle}
              className={`group rounded-2xl border p-5 transition-colors [&[open]]:border-brand-gold/30 ${
                lead.status === "new"
                  ? "border-brand-gold/35 bg-brand-gold/8"
                  : "border-brand-beige/12 bg-brand-ivory/4"
              }`}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:hidden [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 space-y-2">
                  <p className="text-lg font-medium text-brand-ivory">{lead.name}</p>
                  <p className="text-sm text-brand-ivory/68">{lead.interestType}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-beige/55">{lead.formattedDate}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant={lead.status === "new" ? "gold" : "outline"}>
                    {getLeadStatusLabel(lead.status)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-brand-ivory/55 transition hover:bg-red-400/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDeletingLead(lead);
                      }}
                      aria-label={`Excluir lead ${lead.name}`}
                      title="Excluir lead"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                    <ChevronDown className="size-4 text-brand-beige/55 transition group-open:rotate-180" aria-hidden="true" />
                  </div>
                </div>
              </summary>

              <div className="mt-5 grid gap-5 border-t border-brand-beige/10 pt-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-4">
                  <div className="space-y-1 text-xs text-brand-beige/58">
                    <p className="break-words">{lead.email ?? "Sem e-mail"}</p>
                    {lead.formattedPhone ? <p className="font-numeric">{lead.formattedPhone}</p> : null}
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-brand-beige/55">Mensagem</p>
                    {lead.message ? (
                      <p className="whitespace-pre-line break-words text-sm leading-7 text-brand-ivory/72">{lead.message}</p>
                    ) : (
                      <p className="text-sm text-brand-ivory/45">Nenhuma mensagem informada.</p>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-2 md:w-56">
                  <label htmlFor={`status-${lead.id}`} className="ml-1 block text-xs uppercase tracking-[0.2em] text-brand-beige/55">
                    Atualizar status
                  </label>
                  <select
                    id={`status-${lead.id}`}
                    value={lead.status}
                    disabled={updatingId === lead.id}
                    onChange={(event) => void updateStatus(lead.id, event.target.value)}
                    className="h-11 w-full cursor-pointer rounded-2xl border border-brand-beige/18 bg-brand-navy px-3 text-sm text-brand-ivory outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {leadStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
          Nenhum lead encontrado com este status.
        </div>
      )}

      {filteredLeads.length ? (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLeads.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setCurrentPage(1);
          }}
        />
      ) : null}

      {deletingLead ? createPortal(
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/92 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !deletePending) {
              setDeletingLead(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-brand-beige/20 bg-brand-navy p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Confirmar exclusão</p>
                <h2 id="delete-lead-title" className="mt-2 font-display text-2xl text-brand-ivory">Excluir lead?</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-9 px-0 text-brand-ivory/65"
                onClick={() => setDeletingLead(null)}
                disabled={deletePending}
                aria-label="Fechar confirmação"
                title="Fechar"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
              O lead de <strong className="text-brand-ivory">{deletingLead.name}</strong> será removido definitivamente.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingLead(null)} disabled={deletePending}>
                Cancelar
              </Button>
              <Button type="button" size="sm" variant="gold" onClick={() => void deleteLead()} disabled={deletePending}>
                {deletePending ? "Excluindo..." : "Confirmar exclusão"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
