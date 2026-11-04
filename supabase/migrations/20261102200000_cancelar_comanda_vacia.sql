-- Si se abre una mesa/barra pero no se llega a añadir ningún plato y el
-- camarero vuelve atrás, la comanda vacía no debe quedarse "abierta" para
-- siempre — se cancela sola y la mesa vuelve a estar libre. Solo actúa si
-- de verdad no tiene ninguna línea y sigue en 'abierta' (nunca si ya se
-- envió algo a cocina, se pidió la cuenta o se cobró).
create or replace function cancelar_comanda_vacia(comanda_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tiene_lineas boolean;
  esta_abierta boolean;
begin
  select exists(select 1 from comanda_lineas where comanda_id = comanda_id_input)
    into tiene_lineas;
  select exists(select 1 from comandas where id = comanda_id_input and estado = 'abierta')
    into esta_abierta;

  if tiene_lineas or not esta_abierta then
    return;
  end if;

  update mesas set estado = 'libre'
  where id in (select mesa_id from comanda_mesas where comanda_id = comanda_id_input);

  delete from comandas where id = comanda_id_input;
end;
$$;

grant execute on function cancelar_comanda_vacia(uuid) to anon, authenticated;
