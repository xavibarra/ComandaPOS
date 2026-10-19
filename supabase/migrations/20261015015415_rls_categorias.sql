-- Se me olvidó al crear "categorias" — misma política permisiva que el resto
-- de tablas del esquema inicial (ver el TODO de RLS en decisiones.md).
alter table categorias enable row level security;

create policy "allow all - categorias" on categorias for all using (true) with check (true);
