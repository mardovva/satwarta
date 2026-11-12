alter table public.officers add column if not exists active boolean not null default true;
alter table public.officers drop constraint if exists officers_role_check;
alter table public.officers add constraint officers_role_check check (role in ('officer', 'national', 'admin'));

create table if not exists public.officer_audit (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  actor_id     uuid references auth.users (id) on delete set null,
  actor_name   text not null,
  action       text not null check (action in ('create', 'update', 'reset_password', 'deactivate', 'reactivate', 'delete')),
  target_id    uuid,
  target_label text not null,
  details      jsonb not null default '{}'
);
create index if not exists officer_audit_at_idx on public.officer_audit (at desc);
alter table public.officer_audit enable row level security;
revoke all on public.officer_audit from anon, authenticated;
grant select, insert on public.officer_audit to service_role;
grant usage, select on sequence public.officer_audit_id_seq to service_role;

create or replace function public.apply_officer_action(
  p_report text, p_officer uuid, p_expected text, p_new text, p_note text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  o   public.officers%rowtype;
  r   public.reports%rowtype;
  hid bigint;
begin
  select * into o from public.officers where id = p_officer;
  if not found or not o.active then return null; end if;

  select * into r from public.reports where id = p_report for update;
  if not found then return null; end if;

  if r.status <> p_expected then return null; end if;

  if not exists (
    select 1 from (values
      ('Submitted', 'Under Review'), ('Under Review', 'Verified'), ('Under Review', 'Rejected'),
      ('Verified', 'In Progress'), ('In Progress', 'In Progress'), ('In Progress', 'Resolved')
    ) as t(a, b) where t.a = p_expected and t.b = p_new
  ) then return null; end if;

  if o.role = 'officer' and not (r.province = any (o.regions)) then return null; end if;
  if o.role <> 'admin' and r.handled_by is not null and r.handled_by <> p_officer then return null; end if;

  if char_length(coalesce(p_note, '')) < 3 or char_length(p_note) > 500 then return null; end if;

  update public.reports set status = p_new, handled_by = coalesce(handled_by, p_officer) where id = p_report;

  insert into public.report_history (report_id, status, note, officer_id, officer_name, officer_agency)
  values (p_report, p_new, p_note, p_officer, o.full_name, o.agency)
  returning id into hid;

  return hid;
end;
$$;

revoke all on function public.apply_officer_action(text, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_officer_action(text, uuid, text, text, text) to service_role;

