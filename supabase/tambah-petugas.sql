insert into public.officers (id, full_name, agency, role, regions)
select id, 'Tim Penanganan Satwa', 'BKSDA Riau', 'officer', array['Riau', 'Jambi']
from auth.users
where email = 'petugas@domain-nyata.com'
on conflict (id) do update
  set full_name = excluded.full_name, agency = excluded.agency, role = excluded.role, regions = excluded.regions;

