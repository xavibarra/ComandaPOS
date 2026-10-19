-- Las categorías pasan de ser texto libre en platos.categoria a una tabla
-- propia con orden explícito — cada restaurante define las suyas y el
-- orden en que se muestran, sin tocar código.
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden integer not null
);

-- Datos de prueba de CRIT, con el orden que ya veníamos usando.
insert into categorias (nombre, orden) values
  ('Entrants', 1),
  ('Principals', 2),
  ('Postres', 3),
  ('Begudes', 4);

alter table platos add column categoria_id uuid references categorias(id);

-- Migrar los platos existentes del texto libre a la categoría correspondiente.
update platos p
set categoria_id = c.id
from categorias c
where p.categoria = c.nombre;

alter table platos alter column categoria_id set not null;
alter table platos drop column categoria;
