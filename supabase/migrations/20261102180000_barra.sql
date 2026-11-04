-- "Barra" son mesas virtuales para las ventas que no corresponden a ninguna
-- mesa física (sobre todo bebidas pedidas directamente en el mostrador).
-- Reutilizan toda la infraestructura de comandas ya existente (crear_comanda,
-- agregar_linea, cobrar_comanda...) sin tocar nada de esquema más allá de esta
-- columna: es_barra solo sirve para que el mapa de mesas de las tablets
-- (pensado para mesas físicas) no las mezcle con las reales.
alter table mesas add column es_barra boolean not null default false;

-- Se numeran "1", "2", "3"... ("Barra" ya está en el título de la pantalla,
-- repetirlo en cada ficha era redundante). Arranca con una sola: la siguiente
-- se crea sola en cuanto hace falta (ver el trigger de abajo).
insert into mesas (nombre, tamano, forma, es_barra) values
  ('1', 2, 'rectangular', true);

-- Siempre debe quedar al menos una barra libre para poder abrir una comanda
-- nueva sin esperar a que se libere otra. Cada vez que una barra deja de
-- estar "libre", si no queda ninguna otra libre, se crea la siguiente
-- numerada automáticamente.
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
