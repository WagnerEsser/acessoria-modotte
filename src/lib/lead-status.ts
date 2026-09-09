export const leadStatusOptions = [
  { value: "new", label: "Novo" },
  { value: "read", label: "Lido" },
  { value: "in_progress", label: "Em atendimento" },
  { value: "qualified", label: "Qualificado" },
  { value: "won", label: "Convertido" },
  { value: "lost", label: "Encerrado" },
] as const;

const leadStatusLabels: Record<string, string> = Object.fromEntries(
  leadStatusOptions.map(({ value, label }) => [value, label]),
);

export function getLeadStatusLabel(status: string) {
  return leadStatusLabels[status] ?? status;
}
