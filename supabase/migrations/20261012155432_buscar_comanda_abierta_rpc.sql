-- Dada una mesa, busca su comanda activa (no cobrada). Una mesa puede haber
-- tenido varias comandas a lo largo del tiempo (una por cada vez que se ha
-- usado); nos quedamos con la más reciente que no esté cerrada.
create or replace function buscar_comanda_abierta(mesa_id_input uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select cm.comanda_id
  from comanda_mesas cm
  join comandas c on c.id = cm.comanda_id
  where cm.mesa_id = mesa_id_input
    and c.estado != 'cobrada'
  order by c.created_at desc
  limit 1;
$$;

grant execute on function buscar_comanda_abierta(uuid) to anon, authenticated;
