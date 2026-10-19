-- current_date usa la zona horaria del servidor (UTC en Supabase por
-- defecto), no la de España — el contador se reiniciaría de madrugada,
-- no a medianoche local. Usamos la zona horaria explícita 'Europe/Madrid',
-- que además ajusta sola el cambio de hora verano/invierno.
create or replace function crear_comanda(camarero_id_input uuid, mesa_ids uuid[], comensales_input int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nueva_comanda_id uuid;
  numero_del_dia integer;
  hoy date;
begin
  hoy := (now() at time zone 'Europe/Madrid')::date;

  insert into contadores_diarios (fecha, ultimo_numero)
  values (hoy, 1)
  on conflict (fecha) do update set ultimo_numero = contadores_diarios.ultimo_numero + 1
  returning ultimo_numero into numero_del_dia;

  insert into comandas (camarero_id, comensales, numero)
  values (camarero_id_input, comensales_input, numero_del_dia)
  returning id into nueva_comanda_id;

  insert into comanda_mesas (comanda_id, mesa_id)
  select nueva_comanda_id, unnest(mesa_ids);

  update mesas set estado = 'abierta' where id = any(mesa_ids);

  return nueva_comanda_id;
end;
$$;
