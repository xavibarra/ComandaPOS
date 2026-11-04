-- Más datos de perfil del camarero, todos opcionales: solo el nombre y el PIN
-- son obligatorios para poder darlo de alta y que inicie sesión.
alter table camareros add column telefono text;
alter table camareros add column email text;

-- crear_camarero cambia de firma (2 parámetros -> 4, los nuevos opcionales).
-- "create or replace" no sustituye una función si la lista de parámetros no
-- coincide exactamente: habría quedado una función duplicada y ambigua para
-- los dos argumentos de siempre, así que se borra la versión vieja a mano.
drop function if exists crear_camarero(text, text);

create or replace function crear_camarero(
  nombre_input text,
  pin text,
  telefono_input text default null,
  email_input text default null
)
returns table (id uuid, nombre text)
language sql
security definer
set search_path = public, extensions
as $$
  insert into camareros (nombre, pin_hash, telefono, email)
  values (nombre_input, crypt(pin, gen_salt('bf')), telefono_input, email_input)
  returning id, nombre;
$$;

grant execute on function crear_camarero(text, text, text, text) to anon, authenticated;

-- Cambio del PIN largo de admin. restaurant_settings tiene siempre una sola
-- fila por instalación, así que no hace falta identificarla por id.
create or replace function cambiar_pin_admin(pin_nuevo text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update restaurant_settings
  set admin_pin_hash = crypt(pin_nuevo, gen_salt('bf'));
$$;

grant execute on function cambiar_pin_admin(text) to anon, authenticated;
