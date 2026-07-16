-- ===== Toko Baju — Supabase Schema =====
-- Jalankan di Supabase Dashboard > SQL Editor > New query > paste > Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  badge text,
  image text,
  description text default '',
  sizes jsonb default '["S","M","L","XL"]'::jsonb,
  colors jsonb default '["Black","White","Navy"]'::jsonb,
  stock int not null default 0,
  created_at timestamptz default now()
);

-- migrate existing table (jika tabel sudah ada sebelum kolom ditambahkan)
alter table products add column if not exists description text default '';
alter table products add column if not exists sizes jsonb default '["S","M","L","XL"]'::jsonb;
alter table products add column if not exists colors jsonb default '["Black","White","Navy"]'::jsonb;
alter table products add column if not exists stock int not null default 0;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  status text default 'pending',
  total numeric(10,2) not null,
  shipping_address jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade,
  product_id uuid references products,
  name text not null,
  price numeric(10,2) not null,
  qty int default 1
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id uuid not null references products on delete cascade,
  quantity int not null default 1,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  product_id uuid references products on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart_items enable row level security;
alter table wishlist enable row level security;

-- products: public read, anon write (admin masih public — ponytail: ganti saat ada auth admin)
drop policy if exists "products read" on products;
create policy "products read" on products for select using (true);
drop policy if exists "products write" on products;
create policy "products write" on products for all
  using ( (select is_admin from public.profiles where id = auth.uid()) )
  with check ( (select is_admin from public.profiles where id = auth.uid()) );

-- profiles
drop policy if exists "profiles own" on profiles;
create policy "profiles own" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles insert own" on profiles;
create policy "profiles insert own" on profiles for insert with check (auth.uid() = id);

-- orders
drop policy if exists "orders own" on orders;
create policy "orders own" on orders for select using (auth.uid() = user_id);
drop policy if exists "orders insert" on orders;
create policy "orders insert" on orders for insert with check (true);
drop policy if exists "orders update own" on orders;
create policy "orders update own" on orders for update using (auth.uid() = user_id);

-- order_items
drop policy if exists "order_items read" on order_items;
create policy "order_items read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
drop policy if exists "order_items insert" on order_items;
create policy "order_items insert" on order_items for insert with check (true);

-- cart_items
drop policy if exists "cart_items own" on cart_items;
create policy "cart_items own" on cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- wishlist
drop policy if exists "wishlist own" on wishlist;
create policy "wishlist own" on wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- view untuk admin dashboard
drop view if exists popular_products;
create view popular_products as
select p.id, p.name, p.image, coalesce(sum(oi.qty), 0)::int as total_sold
from order_items oi
join products p on oi.product_id = p.id
group by p.id, p.name, p.image
order by total_sold desc;

-- auto create profile saat signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===== Seed 9 produk awal (opsional) =====
insert into products (name, price, original_price, badge, image, description, sizes, colors, stock) values
('Jaket Ritsleting Ringan', 189.00, 245.00, 'Baru', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=550&fit=crop', 'Jaket ritsleting berbahan kain campuran katun yang bernapas. Dilengkapi kerah tegak, ritsleting depan, dan ujung yang dapat disesuaikan. Cocok untuk pelapis di cuaca peralihan.', '["S","M","L","XL"]', '["Black","Navy","Olive"]', 25),
('Mantel Kasual Modern', 279.00, null, 'Baru', 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=550&fit=crop', 'Mantel oversized modern dengan potongan santai. Dibuat dari campuran wol premium dengan kerah notched, saku samping, dan penutup single-breasted. Tingkatkan penampilan apa pun.', '["S","M","L","XL"]', '["Charcoal","Camel","Black"]', 10),
('Jaket Kulit Sintetis Pas', 229.00, 299.00, 'Diskon', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=550&fit=crop', 'Jaket kulit sintetis slim-fit dengan ritsleting asimetris. Dilengkapi panel bahu quilted, kerah kancing jepret, dan banyak saku ritsleting. Keren namun tetap elegan.', '["S","M","L","XL"]', '["Black","Burgundy"]', 15),
('Blus Smock Ruffle Lembut', 129.00, null, 'Baru', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=550&fit=crop', 'Blus elegan dengan hiasan ruffle berbahan smock ringan. Memiliki garis leher V, lengan panjang mengembang dengan manset elastis, dan siluet flowy.', '["XS","S","M","L"]', '["White","Blush","Sky Blue"]', 30),
('Jaket Bomber Berlapis Klasik', 199.00, 260.00, 'Diskon', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=550&fit=crop', 'Jaket bomber berlapis dengan hasil akhir satin dan manset bergaris. Dilengkapi ritsleting depan, kerah tegak, dan saku samping. Kehangatan ringan.', '["S","M","L","XL"]', '["Black","Army Green","Navy"]', 0),
('Jaket Layering Bunga Ringan', 169.00, null, 'Baru', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=550&fit=crop', 'Jaket motif bunga cantik dengan desain terbuka santai. Memiliki siluet melengkung lembut dengan lengan tiga perempat dan nuansa ringan.', '["S","M","L","XL"]', '["Multi","Black Floral"]', 20),
('Mantel Campuran Wol Rapi', 349.00, null, 'Premium', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=550&fit=crop', 'Mantel double-breasted mewah dalam campuran wol premium. Dilengkapi kerah peak, saku flap, pinggang bersabuk, dan interior sebagian berlapis. Investasi fashion.', '["S","M","L","XL","XXL"]', '["Camel","Charcoal","Black"]', 5),
('Sweater Rajut Nyaman', 119.00, 150.00, 'Diskon', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=550&fit=crop', 'Sweater rajut chunky dengan desain crewneck santai. Terbuat dari campuran akrilik-wol lembut dengan manset dan ujung bergaris. Pokok kebutuhan cuaca dingin.', '["S","M","L","XL"]', '["Cream","Heather Gray","Burgundy","Navy"]', 8),
('Jaket Denim Slim Fit', 179.00, null, 'Baru', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=550&fit=crop', 'Jaket denim klasik dengan potongan slim fit modern. Dilengkapi penutup kancing depan, saku dada, pengatur pinggang, dan detail distressed halus.', '["S","M","L","XL"]', '["Light Wash","Medium Wash","Black"]', 0);
