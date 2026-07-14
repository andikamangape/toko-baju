# KEY NOTES — VALORE Toko Baju

Poin-poin penting yang bisa dipelajari dari project ini.

---

## 1. Arsitektur & Pola

- **Static SPA**: React frontend langsung komunikasi dengan Supabase (tanpa backend server sendiri)
- **Component-based UI**: Setiap halaman = 1 component di `src/components/`
- **Custom hooks**: `useAuth` (session), `useInfiniteScroll` (IntersectionObserver)
- **Lib pattern**: Logic Supabase dipisah di `src/lib/` (products, orders, cart, dll)

## 2. Supabase (Backend-as-a-Service)

- **Auth**: Email/password, session management, RLS policies
- **Database**: PostgreSQL + RLS (Row Level Security) — data aman per user
- **Storage**: Upload gambar produk ke bucket `products`
- **RLS penting**: `auth.uid()` = user yang login, `using` filter data, `with check` validasi insert
- **`CREATE TABLE IF NOT EXISTS`**: Tidak mengubah tabel yang sudah ada — butuh `ALTER TABLE ADD COLUMN IF NOT EXISTS`

## 3. React & State Management

- **useState + useEffect**: State lokal + side effect (fetch data dari Supabase)
- **useCallback**: Mencegah re-render component anak yang tidak perlu
- **useMemo**: Optimasi filtering & perhitungan harga
- **Props drilling**: State dari App.jsx turun ke child components (cart, user)
- **Inline styles**: CSS-in-JS via `style={}` (tanpa Tailwind/CSS Module)

## 4. Routing (react-router-dom)

- **Routes + Route**: 10 halaman di App.jsx
- **Navigate**: Redirect (`/login`, `/home`)
- **Layout pattern**: `<Layout>` bungkus Navbar + Footer + content
- **Dynamic params**: `/product/:id` + `useParams()`

## 5. Database Schema & Relations

- **One-to-many**: `orders` → `order_items`, `products` → `reviews`
- **JSON column**: `shipping_address` (jsonb), `sizes`/`colors` (jsonb)
- **Views**: `popular_products` — aggregate dari order_items
- **Trigger**: `handle_new_user()` — auto-create profile di signup
- **`crypto.randomUUID()`**: Generate UUID client-side (untuk order_id)

## 6. UX Patterns

- **Cart persistence**: Guest = in-memory, Logged-in = Supabase `cart_items`
- **Checkout via WhatsApp**: Simpan order ke DB lalu redirect ke WA
- **Stock management**: Cek stok di addToCart, decrement manual di admin confirm
- **Infinite scroll**: IntersectionObserver + `slice()`
- **Loading skeleton**: Shimmer animation CSS + `Skeleton` component
- **Dark mode**: CSS variable swap via class `dark-mode` di `<body>`
- **Toast notification**: Slide-in notifikasi untuk aksi user

## 7. Admin Flow

- **Dashboard**: Statistik (total order, revenue) + popular products
- **CRUD products**: Form inline + table + upload image
- **Order management**: Confirm → decrement stock, update status (pending → confirmed → shipped → completed)

## 8. Error Handling & Pitfalls

- **`.select()` di INSERT**: RLS SELECT policy bisa reject row yang baru diinsert → generate UUID client-side, insert tanpa `.select()`
- **`null = null` di SQL**: Bukan TRUE — hati-hati dengan RLS policy untuk user anonymous
- **`CREATE TABLE IF NOT EXISTS`**: Mengabaikan definisi kolom baru jika tabel sudah ada

## 9. Next Steps / Potential Improvements

- SEO meta tags (react-helmet)
- PWA (vite-plugin-pwa)
- TypeScript migration (`.jsx` → `.tsx`)
- Unit tests (Vitest + React Testing Library)
- Docker deployment
