create extension if not exists pgcrypto;

create table restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  color_accent text,
  color_accent_dark text,
  logo_url text,
  admin_pin_hash text not null,
  admin_recovery_email text,
  created_at timestamptz not null default now()
);

create table camareros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  pin_hash text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table mesas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  pos_x numeric not null default 0,
  pos_y numeric not null default 0,
  tamano integer not null check (tamano in (2, 4, 6)),
  forma text not null check (forma in ('redonda', 'rectangular')),
  estado text not null default 'libre' check (estado in ('libre', 'abierta', 'cocina', 'cuenta_pedida'))
);

create table platos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric(10,2) not null,
  categoria text not null,
  stock integer not null default 0,
  imprime_a_cocina boolean not null default true,
  activo boolean not null default true
);

create table comandas (
  id uuid primary key default gen_random_uuid(),
  camarero_id uuid not null references camareros(id),
  comensales integer not null default 1,
  estado text not null default 'abierta' check (estado in ('abierta', 'cuenta_pedida', 'cobrada')),
  total numeric(10,2),
  created_at timestamptz not null default now(),
  cerrada_at timestamptz
);

create table comanda_mesas (
  comanda_id uuid not null references comandas(id) on delete cascade,
  mesa_id uuid not null references mesas(id),
  primary key (comanda_id, mesa_id)
);

create table comanda_lineas (
  id uuid primary key default gen_random_uuid(),
  comanda_id uuid not null references comandas(id) on delete cascade,
  plato_id uuid not null references platos(id),
  cantidad integer not null default 1,
  precio_unitario numeric(10,2) not null,
  enviado_a_cocina boolean not null default false,
  enviado_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_comandas_estado on comandas(estado);
create index idx_comandas_cerrada_at on comandas(cerrada_at);
create index idx_comanda_lineas_comanda_id on comanda_lineas(comanda_id);

-- RLS activado pero permisivo por ahora: la app usa PIN propio, no Supabase Auth,
-- así que de momento el anon key tiene acceso completo. Revisar en la fase de auth (ver decisiones.md).
alter table restaurant_settings enable row level security;
alter table camareros enable row level security;
alter table mesas enable row level security;
alter table platos enable row level security;
alter table comandas enable row level security;
alter table comanda_mesas enable row level security;
alter table comanda_lineas enable row level security;

create policy "allow all - restaurant_settings" on restaurant_settings for all using (true) with check (true);
create policy "allow all - camareros" on camareros for all using (true) with check (true);
create policy "allow all - mesas" on mesas for all using (true) with check (true);
create policy "allow all - platos" on platos for all using (true) with check (true);
create policy "allow all - comandas" on comandas for all using (true) with check (true);
create policy "allow all - comanda_mesas" on comanda_mesas for all using (true) with check (true);
create policy "allow all - comanda_lineas" on comanda_lineas for all using (true) with check (true);
