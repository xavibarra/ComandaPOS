-- Bug: pedir_cuenta solo actualizaba mesas.estado, nunca comandas.estado.
-- Por eso el plano de mesas mostraba "cuenta_pedida" correctamente, pero
-- OrderPage (que lee order.estado desde comandas) seguía viendo "abierta".
create or replace function pedir_cuenta(comanda_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update comandas
  set estado = 'cuenta_pedida'
  where id = comanda_id_input;

  update mesas
  set estado = 'cuenta_pedida'
  where id in (select mesa_id from comanda_mesas where comanda_id = comanda_id_input);
end;
$$;
