-- Alta de camarero desde el panel de admin: el PIN se hashea en el servidor,
-- igual que ya se hace al verificarlo — el cliente nunca ve ni genera el hash.
create or replace function crear_camarero(nombre_input text, pin text)
returns table (id uuid, nombre text)
language sql
security definer
set search_path = public, extensions
as $$
  insert into camareros (nombre, pin_hash)
  values (nombre_input, crypt(pin, gen_salt('bf')))
  returning id, nombre;
$$;

grant execute on function crear_camarero(text, text) to anon, authenticated;

-- Cambio de PIN de un camarero ya existente, mismo criterio de hash.
create or replace function cambiar_pin_camarero(camarero_id_input uuid, pin_nuevo text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update camareros
  set pin_hash = crypt(pin_nuevo, gen_salt('bf'))
  where id = camarero_id_input;
$$;

grant execute on function cambiar_pin_camarero(uuid, text) to anon, authenticated;
