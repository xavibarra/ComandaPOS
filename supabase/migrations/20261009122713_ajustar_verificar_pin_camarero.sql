-- Antes, verificar_pin_camarero(pin) buscaba a ciegas entre todos los camareros.
-- Ahora el flujo de login elige primero al camarero (por nombre/avatar) y luego
-- pide su PIN, así que verificamos directamente contra esa persona.
drop function if exists verificar_pin_camarero(text);

create or replace function verificar_pin_camarero(camarero_id_input uuid, pin text)
returns table (id uuid, nombre text)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nombre
  from camareros
  where id = camarero_id_input
    and activo = true
    and pin_hash = crypt(pin, pin_hash)
  limit 1;
$$;

grant execute on function verificar_pin_camarero(uuid, text) to anon, authenticated;
