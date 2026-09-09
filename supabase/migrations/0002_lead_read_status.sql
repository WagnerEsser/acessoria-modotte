-- Add the read state for databases that already applied the initial schema.
alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (status in ('new', 'read', 'qualified', 'in_progress', 'won', 'lost'));
