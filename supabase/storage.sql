-- ===== Supabase Storage: products bucket =====
-- Jalankan di Supabase Dashboard > SQL Editor

-- 1. Buat bucket 'products' (public)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- 2. Policy: public bisa baca (SELECT)
drop policy if exists "products public read" on storage.objects;
create policy "products public read" on storage.objects
  for select using (bucket_id = 'products');

-- 3. Policy: admin (auth user) bisa upload/update/delete
drop policy if exists "products admin write" on storage.objects;
create policy "products admin write" on storage.objects
  for all using (
    bucket_id = 'products' and
    (select is_admin from public.profiles where id = auth.uid())
  )
  with check (
    bucket_id = 'products' and
    (select is_admin from public.profiles where id = auth.uid())
  );
