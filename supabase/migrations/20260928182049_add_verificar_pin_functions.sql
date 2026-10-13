-- Verifica el PIN de un camarero sin exponer pin_hash al cliente.
-- security definer: se ejecuta con permisos del propietario de la función,
-- así puede leer pin_hash aunque en el futuro se restrinja el select directo
-- sobre la tabla camareros desde el rol anon.
create or replace function verificar_pin_camarero(pin text)
returns table (id uuid, nombre text)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nombre
  from camareros
  where activo = true
    and pin_hash = crypt(pin, pin_hash)
  limit 1;
$$;

grant execute on function verificar_pin_camarero(text) to anon, authenticated;

-- Igual que arriba, pero para el PIN largo del admin.
-- Solo confirma sí/no: no hay "sesión de admin" con datos propios, es un único PIN por restaurante.
create or replace function verificar_pin_admin(pin text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from restaurant_settings
    where admin_pin_hash = crypt(pin, admin_pin_hash)
  );
$$;

grant execute on function verificar_pin_admin(text) to anon, authenticated;
