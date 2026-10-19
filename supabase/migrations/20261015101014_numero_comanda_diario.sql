-- Número de comanda visible, secuencial y reiniciado cada día (no un UUID
-- ilegible para el personal). El incremento es atómico vía "insert ... on
-- conflict ... do update", así que es seguro aunque dos tablets creen una
-- comanda en el mismo instante — no hace falta ningún cron para resetear:
-- como la clave es la fecha, cada día nuevo simplemente no tiene fila
-- todavía y empieza solo en 1.
create table contadores_diarios (
  fecha date primary key,
  ultimo_numero integer not null default 0
);

alter table contadores_diarios enable row level security;
create policy "allow all - contadores_diarios" on contadores_diarios for all using (true) with check (true);

alter table comandas add column numero integer;

create or replace function crear_comanda(camarero_id_input uuid, mesa_ids uuid[], comensales_input int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nueva_comanda_id uuid;
  numero_del_dia integer;
begin
  insert into contadores_diarios (fecha, ultimo_numero)
  values (current_date, 1)
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
