# PROGRESS — VALORE Toko Baju

## ✅ Selesai

- [x] Inisialisasi project (Vite + React 18)
- [x] Routing (react-router-dom) — 10 halaman
- [x] Dark mode toggle
- [x] Splash screen (`/`) dengan animasi
- [x] Homepage hero + kategori
- [x] Katalog produk (`/products`) + filter kategori
- [x] Shopping cart (in-memory)
- [x] Checkout: kontak → pengiriman → konfirmasi via WhatsApp
- [x] Auth (login/register via Supabase Auth)
- [x] Account dashboard — riwayat order
- [x] Admin panel CRUD produk + upload gambar
- [x] Route guard admin (`RequireAdmin`)
- [x] Halaman About dengan parallax
- [x] Footer
- [x] Toast notifikasi
- [x] Responsive design
- [x] Database schema (5 tabel, RLS, trigger)
- [x] Storage bucket produk + policies
- [x] Build production (`npm run build`)
- [x] Product Detail Page (`/product/:id`) — gambar besar, size/color selector, quantity, add-to-cart

## 🚧 Belum / Perlu Perbaikan

- [x] Order via WhatsApp (redirect setelah pesanan tersimpan)
- [x] Cart persist ke DB (via Supabase `cart_items` table, sync otomatis saat login/logout)
- [ ] Unit / integration tests
- [ ] TypeScript migration (ganti `.jsx` → `.tsx`)
- [x] Infinite scroll / pagination di katalog produk (IntersectionObserver, load 12 per batch)
- [x] Search produk (real-time filter dari nama, di ProductsPage)
- [x] Order status tracking (admin confirm → decrement stock, update status, customer lihat badge di Account)
- [ ] Docker / deployment config
- [ ] SEO meta tags per halaman
- [x] Loading skeleton / error boundary components (shimmer placeholder di Products, Detail, Account, Admin)
- [x] Stock management (kolom `stock`, decrement saat order, cek stok pas add-to-cart)
- [x] Admin dashboard (statistik total order, revenue, produk terlaris)
- [ ] Kupon diskon (input promo code di Checkout)
- [ ] Size guide (tabel panduan ukuran baju)
- [ ] PWA (bisa "install" di HP customer)

## 🏗 Tech Stack

React 18, Vite 5, Supabase (Auth + DB + Storage), react-router-dom 7, CSS Variables, Font Awesome 5, Google Fonts
