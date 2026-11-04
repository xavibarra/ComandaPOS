-- Parche sobre 20261102180000_barra.sql: esa migración se aplicó a mano
-- antes de corregirla (nombres "Barra 1"/"Barra 2"/"Barra 3" y sin el
-- trigger de autocreación). Este archivo solo arregla lo ya aplicado, sin
-- volver a insertar filas ni tocar nada más.

-- "Barra 1" -> "1", "Barra 2" -> "2", "Barra 3" -> "3".
update mesas set nombre = regexp_replace(nombre, '^Barra ', '')
where es_barra = true;

drop trigger if exists trg_crear_siguiente_barra on mesas;

create or replace function crear_siguiente_barra_si_falta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from mesas where es_barra = true and estado = 'libre') then
    insert into mesas (nombre, tamano, forma, es_barra)
    values (
      (select (coalesce(max(nombre::int), 0) + 1)::text from mesas where es_barra = true),
      2, 'rectangular', true
    );
  end if;
  return null;
end;
$$;

create trigger trg_crear_siguiente_barra
after update of estado on mesas
for each row
when (new.es_barra = true and old.estado = 'libre' and new.estado <> 'libre')
execute function crear_siguiente_barra_si_falta();
