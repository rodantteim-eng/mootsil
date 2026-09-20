-- C389 | Consulta de postulación únicamente por teléfono.
-- Ejecutar UNA VEZ en el proyecto Supabase de Mootsil.
create or replace function public.consultar_estado_postulacion_telefono(p_telefono text)
returns table (
  id uuid,
  estado text,
  motivo_rechazo text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.estado, p.motivo_rechazo
  from public.postulaciones_personal p
  where regexp_replace(coalesce(p.telefono,''), '\\D', '', 'g') =
        regexp_replace(coalesce(p_telefono,''), '\\D', '', 'g')
  order by p.created_at desc nulls last
  limit 1;
$$;

revoke all on function public.consultar_estado_postulacion_telefono(text) from public;
grant execute on function public.consultar_estado_postulacion_telefono(text) to anon, authenticated;
