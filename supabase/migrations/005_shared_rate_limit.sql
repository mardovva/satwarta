-- Migrasi 005: pembatas permintaan bersama (lintas server) dan batas harian fitur AI.
-- Untuk database yang SUDAH berjalan: tempel isi file ini di SQL Editor lalu Run. (schema.sql terbaru sudah memuatnya.)
-- Tanpa migrasi ini aplikasi tetap berjalan, tetapi memakai pembatas di memori (per server, lebih lemah).

-- 8f. PEMBATAS PERMINTAAN BERSAMA ---------------------------------------------------------------------------
-- Penghitung per kunci (mis. "submit:203.0.113.9" atau "ai-chat-day:2026-11-09") dengan jendela waktu tetap. Berbeda dengan
-- penghitung di memori server, ini berlaku untuk semua instance Vercel sekaligus. Satu pernyataan upsert = atomik: dua permintaan
-- bersamaan tidak bisa sama-sama lolos melewati batas. Hanya service_role yang boleh memakai.
create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         integer not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant select, insert, update, delete on public.rate_limits to service_role;

create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'argumen pembatas tidak valid';
  end if;

  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
        hits         = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
  returning hits into v_hits;

  -- bersih-bersih ringan: sesekali buang kunci yang sudah lama tidak dipakai
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

