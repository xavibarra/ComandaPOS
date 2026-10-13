-- Al tocar un plato: si ya hay una línea PENDIENTE (no enviada a cocina) de
-- ese plato en esta comanda, suma 1 a su cantidad; si no, crea una línea
-- nueva. Todo en una transacción, para que dos clicks seguidos no acaben
-- creando dos líneas en vez de sumar.
create or replace function agregar_linea(comanda_id_input uuid, plato_id_input uuid, precio_input numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  linea_id uuid;
begin
  select id into linea_id
  from comanda_lineas
  where comanda_id = comanda_id_input
    and plato_id = plato_id_input
    and enviado_a_cocina = false
  limit 1;

  if linea_id is not null then
    update comanda_lineas set cantidad = cantidad + 1 where id = linea_id;
  else
    insert into comanda_lineas (comanda_id, plato_id, precio_unitario)
    values (comanda_id_input, plato_id_input, precio_input)
    returning id into linea_id;
  end if;

  return linea_id;
end;
$$;

grant execute on function agregar_linea(uuid, uuid, numeric) to anon, authenticated;
