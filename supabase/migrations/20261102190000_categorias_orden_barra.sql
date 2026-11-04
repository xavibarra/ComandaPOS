-- Permite que la pantalla de Barra muestre las categorías en un orden
-- distinto al de las mesas (p. ej. Begudes primero) sin tocar el de siempre.
-- Arranca igual que "orden" — se reordena de forma independiente desde
-- "Categories" en el panel de admin si se quiere cambiar.
alter table categorias add column orden_barra integer;
update categorias set orden_barra = orden;
alter table categorias alter column orden_barra set not null;
