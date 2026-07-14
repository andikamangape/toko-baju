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
('Lightweight Zip Jacket', 189.00, 245.00, 'New', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=550&fit=crop', 'Zip-up jacket crafted from breathable cotton-blend fabric. Features a stand-up collar, front zipper closure, and adjustable hem. Perfect for layering in transitional weather.', '["S","M","L","XL"]', '["Black","Navy","Olive"]', 25),
('Modern Casual Overcoat', 279.00, null, 'New', 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=550&fit=crop', 'Sleek oversized overcoat with a relaxed fit. Crafted from premium wool blend with notched lapels, side pockets, and a single-breasted closure. Elevate any look.', '["S","M","L","XL"]', '["Charcoal","Camel","Black"]', 10),
('Fitted Faux Leather Jacket', 229.00, 299.00, 'Sale', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=550&fit=crop', 'Slim-fit faux leather jacket with asymmetric zipper. Features quilted shoulder panels, snap-button lapels, and multiple zip pockets. Edgy yet refined.', '["S","M","L","XL"]', '["Black","Burgundy"]', 15),
('Soft Ruffle Smock Blouse', 129.00, null, 'New', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=550&fit=crop', 'Elegant ruffle-trimmed blouse in lightweight smock fabric. Features a V-neckline, billowy long sleeves with elastic cuffs, and a flowy silhouette.', '["XS","S","M","L"]', '["White","Blush","Sky Blue"]', 30),
('Classic Padded Bomber Jacket', 199.00, 260.00, 'Sale', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=550&fit=crop', 'Padded bomber jacket with satin finish and ribbed cuffs. Features a front zip closure, stand-up collar, and side welt pockets. Lightweight warmth.', '["S","M","L","XL"]', '["Black","Army Green","Navy"]', 0),
('Floral Lightweight Layered Jacket', 169.00, null, 'New', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=550&fit=crop', 'Beautiful floral print jacket with a relaxed open-front design. Features a softly draped silhouette with three-quarter sleeves and a lightweight feel.', '["S","M","L","XL"]', '["Multi","Black Floral"]', 20),
('Tailored Wool Blend Coat', 349.00, null, 'Premium', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=550&fit=crop', 'Luxurious double-breasted coat in premium wool blend. Features peak lapels, flap pockets, a belted waist, and partially lined interior. Investment piece.', '["S","M","L","XL","XXL"]', '["Camel","Charcoal","Black"]', 5),
('Cozy Knit Sweater', 119.00, 150.00, 'Sale', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=550&fit=crop', 'Chunky knit sweater with a relaxed crewneck design. Made from soft acrylic-wool blend with ribbed cuffs and hem. Essential cold-weather staple.', '["S","M","L","XL"]', '["Cream","Heather Gray","Burgundy","Navy"]', 8),
('Slim Fit Denim Jacket', 179.00, null, 'New', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=550&fit=crop', 'Classic denim jacket with a modern slim fit. Features button-front closure, chest pockets, adjustable waist tabs, and subtle distress details.', '["S","M","L","XL"]', '["Light Wash","Medium Wash","Black"]', 0);
