
alter table public.reports
  add column if not exists location_detail text not null default '' check (char_length(location_detail) <= 300);

notify pgrst, 'reload schema';
