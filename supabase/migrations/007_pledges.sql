create table if not exists public.pledges (
  code        text primary key default ('DNS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  report_id   text not null references public.reports (id) on delete cascade,
  amount      integer not null check (amount between 10000 and 100000000),
  donor_name  text not null default '' check (char_length(donor_name) <= 60),
  anonymous   boolean not null default false,
  message     text not null default '' check (char_length(message) <= 200),
  method      text not null default '' check (char_length(method) <= 60),
  status      text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at  timestamptz not null default now()
);
create index if not exists pledges_report_idx  on public.pledges (report_id);
create index if not exists pledges_created_idx on public.pledges (created_at desc);

alter table public.pledges enable row level security;
revoke all on public.pledges from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.pledges to service_role;
