-- EXTRAS: suplemento opcional, se puede marcar más de uno a la vez (p. ej.
-- "Formatge +1€" en un entrepà). Vive en una categoría entera —la ven todos
-- los platos de esa categoría, para no repetir el mismo extra plato a
-- plato— o en un plato concreto, para algo específico de ese plato. Nunca
-- en los dos sitios a la vez ni en ninguno (el check de abajo).
create table extras (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete cascade,
  plato_id uuid references platos(id) on delete cascade,
  nombre text not null,
  precio numeric(10,2) not null default 0,
  orden integer not null default 0,
  check (
    (categoria_id is not null and plato_id is null) or
    (categoria_id is null and plato_id is not null)
  )
);

create index idx_extras_categoria on extras(categoria_id);
create index idx_extras_plato on extras(plato_id);

-- VARIANTES: elección única por plato que SUSTITUYE su precio, no lo suma
-- (p. ej. "Format: Copa 3€ / Ampolla 15€"). A diferencia de los extras, solo
-- tiene sentido atada a un plato concreto — no hay "variante de categoría".
create table plato_variante_grupos (
  id uuid primary key default gen_random_uuid(),
  plato_id uuid not null references platos(id) on delete cascade,
  nombre text not null,
  obligatorio boolean not null default false,
  orden integer not null default 0
);

create table plato_variante_opciones (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references plato_variante_grupos(id) on delete cascade,
  nombre text not null,
  precio numeric(10,2) not null default 0,
  orden integer not null default 0
);

alter table extras enable row level security;
alter table plato_variante_grupos enable row level security;
alter table plato_variante_opciones enable row level security;
create policy "allow all - extras" on extras for all using (true) with check (true);
create policy "allow all - plato_variante_grupos" on plato_variante_grupos for all using (true) with check (true);
create policy "allow all - plato_variante_opciones" on plato_variante_opciones for all using (true) with check (true);

-- Snapshot de qué extras/variante llevaba cada línea en el momento de pedir
-- (igual que precio_unitario ya congela el precio del plato) — y es también
-- donde acaban los extras "al momento" que escribe el propio camarero
-- (nombre y precio libres, sin que exista ninguna fila en "extras").
create table comanda_linea_modificadores (
  id uuid primary key default gen_random_uuid(),
  linea_id uuid not null references comanda_lineas(id) on delete cascade,
  nombre text not null,
  precio numeric(10,2) not null
);

alter table comanda_linea_modificadores enable row level security;
create policy "allow all - comanda_linea_modificadores" on comanda_linea_modificadores for all using (true) with check (true);

-- Nota libre del camarero para una línea concreta (p. ej. "sense sal"). Solo
-- tiene sentido editarla mientras la línea siga pendiente — una vez enviada
-- a cocina, la nota ya se imprimió en el tique y no se puede cambiar.
alter table comanda_lineas add column nota text;

-- agregar_linea no cambia su lógica: recibe los modificadores ya resueltos
-- (nombre + precio), sin que le importe si vienen de un extra de categoría,
-- de plato, de una variante, o escritos al momento por el camarero — todos
-- acaban igual en comanda_linea_modificadores. Se borra la versión vieja de
-- 3 parámetros a mano porque "create or replace" no sustituye una función
-- si la lista de parámetros no coincide exactamente.
drop function if exists agregar_linea(uuid, uuid, numeric);

create or replace function agregar_linea(
  comanda_id_input uuid,
  plato_id_input uuid,
  precio_input numeric,
  modificadores_input jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  linea_id uuid;
  tiene_modificadores boolean;
  modificador jsonb;
begin
  tiene_modificadores := modificadores_input is not null and jsonb_array_length(modificadores_input) > 0;

  if not tiene_modificadores then
    select c.id into linea_id
    from comanda_lineas c
    where c.comanda_id = comanda_id_input
      and c.plato_id = plato_id_input
      and c.enviado_a_cocina = false
      and not exists (
        select 1 from comanda_linea_modificadores m where m.linea_id = c.id
      )
    limit 1;
  end if;

  if linea_id is not null then
    update comanda_lineas set cantidad = cantidad + 1 where id = linea_id;
  else
    insert into comanda_lineas (comanda_id, plato_id, precio_unitario)
    values (comanda_id_input, plato_id_input, precio_input)
    returning id into linea_id;

    if tiene_modificadores then
      for modificador in select * from jsonb_array_elements(modificadores_input)
      loop
        insert into comanda_linea_modificadores (linea_id, nombre, precio)
        values (linea_id, modificador->>'nombre', (modificador->>'precio')::numeric);
      end loop;
    end if;
  end if;

  return linea_id;
end;
$$;

grant execute on function agregar_linea(uuid, uuid, numeric, jsonb) to anon, authenticated;
