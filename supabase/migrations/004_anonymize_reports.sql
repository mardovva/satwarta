alter table public.reports add column if not exists anonymized_at timestamptz;

create or replace function public.anonymize_report(p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports
     set reporter_name = 'Dianonimkan', reporter_phone = '00000', reporter_email = null, anonymized_at = now()
   where id = p_id and anonymized_at is null;
  return found;
end;
$$;

create or replace function public.anonymize_old_reports(p_months integer default 12)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if p_months is null or p_months < 1 then raise exception 'p_months minimal 1'; end if;
  update public.reports
     set reporter_name = 'Dianonimkan', reporter_phone = '00000', reporter_email = null, anonymized_at = now()
   where status in ('Resolved', 'Rejected')
     and anonymized_at is null
     and updated_at < now() - make_interval(months => p_months);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.anonymize_report(text) from public, anon, authenticated;
revoke all on function public.anonymize_old_reports(integer) from public, anon, authenticated;
grant execute on function public.anonymize_report(text) to service_role;
grant execute on function public.anonymize_old_reports(integer) to service_role;
