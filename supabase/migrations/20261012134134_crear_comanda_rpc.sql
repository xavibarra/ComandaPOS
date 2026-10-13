-- Crea una comanda + sus mesas asociadas + marca esas mesas como "abierta"
-- en una sola transacción. Si cualquier paso falla (p. ej. corte de wifi
-- a mitad), Postgres deshace todo — no quedan datos a medias.
create or replace function crear_comanda(camarero_id_input uuid, mesa_ids uuid[], comensales_input int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nueva_comanda_id uuid;
begin
  insert into comandas (camarero_id, comensales)
  values (camarero_id_input, comensales_input)
  returning id into nueva_comanda_id;

  insert into comanda_mesas (comanda_id, mesa_id)
  select nueva_comanda_id, unnest(mesa_ids);

  update mesas set estado = 'abierta' where id = any(mesa_ids);

  return nueva_comanda_id;
end;
$$;

grant execute on function crear_comanda(uuid, uuid[], int) to anon, authenticated;
