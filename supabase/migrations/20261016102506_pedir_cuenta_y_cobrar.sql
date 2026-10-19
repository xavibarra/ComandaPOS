-- "Pedir la cuenta": marca todas las mesas de la comanda como cuenta_pedida.
-- Resuelve internamente qué mesas son (vía comanda_mesas), así el cliente
-- solo necesita saber el comanda_id, no los ids de las mesas.
create or replace function pedir_cuenta(comanda_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update mesas
  set estado = 'cuenta_pedida'
  where id in (select mesa_id from comanda_mesas where comanda_id = comanda_id_input);
end;
$$;

grant execute on function pedir_cuenta(uuid) to anon, authenticated;

-- "Cobrar": calcula el total sumando las líneas (cantidad * precio_unitario,
-- el precio ya guardado en el momento de pedir, no el actual del plato),
-- cierra la comanda, y libera las mesas. Todo en una transacción.
create or replace function cobrar_comanda(comanda_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  total_calculado numeric;
begin
  select coalesce(sum(cantidad * precio_unitario), 0) into total_calculado
  from comanda_lineas
  where comanda_id = comanda_id_input;

  update comandas
  set estado = 'cobrada', cerrada_at = now(), total = total_calculado
  where id = comanda_id_input;

  update mesas
  set estado = 'libre'
  where id in (select mesa_id from comanda_mesas where comanda_id = comanda_id_input);
end;
$$;

grant execute on function cobrar_comanda(uuid) to anon, authenticated;
