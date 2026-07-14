-- ===== Admin Auth migration =====
-- Jalankan di Supabase Dashboard > SQL Editor, lalu promote admin manual.

alter table profiles add column if not exists is_admin boolean default false;

drop policy if exists "products write" on products;
create policy "products write" on products for all
  using ( (select is_admin from public.profiles where id = auth.uid()) )
  with check ( (select is_admin from public.profiles where id = auth.uid()) );

-- Promosi user jadi admin:
-- 1. Buka Authentication > Users, copy UUID user tersebut.
-- 2. Uncomment baris bawah, ganti <ADMIN_USER_ID>, lalu Run.
-- update public.profiles set is_admin = true where id = '<ADMIN_USER_ID>';
