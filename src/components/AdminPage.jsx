import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../lib/products.js';
import { uploadProductImage, deleteProductImage } from '../lib/storage.js';
import { getDashboardStats, getPopularProducts, getAllOrders, confirmOrder, updateOrderStatus } from '../lib/orders.js';
import { formatPrice } from '../lib/format.js';

const EMPTY = { id: null, name: '', price: '', originalPrice: '', badge: '', image: '', description: '', sizes: '', colors: '', stock: '' };

const STATUS_COLORS = {
    pending: '#f39c12', confirmed: '#3498db', shipped: '#9b59b6', completed: '#2ecc71', cancelled: '#e74c3c',
};

export default function AdminPage({ products, onChanged }) {
    const [tab, setTab] = useState('dashboard');
    const [form, setForm] = useState(EMPTY);
    const [editing, setEditing] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
    const [popular, setPopular] = useState([]);
    const [orders, setOrders] = useState([]);

    const fetchData = () => {
        getDashboardStats().then(setStats).catch(console.error);
        getPopularProducts().then(setPopular).catch(console.error);
        getAllOrders().then(setOrders).catch(console.error);
    };

    useEffect(fetchData, []);

    const handleConfirm = async (orderId) => {
        try {
            await confirmOrder(orderId);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = form.image;
            if (imageFile) {
                imageUrl = await uploadProductImage(imageFile);
            }

            const payload = {
                name: form.name.trim(),
                price: Number(form.price) || 0,
                originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
                badge: form.badge.trim() || null,
                image: imageUrl || 'https://via.placeholder.com/400x550',
                description: form.description.trim() || '',
                sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : ['S','M','L','XL'],
                colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Black','White','Navy'],
                stock: Number(form.stock) || 0,
            };

            if (editing) await updateProduct(editing, payload);
            else await addProduct(payload);

            cancel();
            onChanged();
        } catch (err) {
            alert(err.message);
        }
    };

    const edit = (p) => {
        setEditing(p.id);
        const sizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || '');
        const colors = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || '');
        setForm({ ...p, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', badge: p.badge || '', description: p.description || '', sizes, colors, stock: p.stock != null ? String(p.stock) : '' });
        setImageFile(null);
        setPreviewUrl(p.image || '');
    };

    const remove = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        try {
            const product = products.find(p => p.id === id);
            if (product && product.image.includes('products/')) {
                await deleteProductImage(product.image);
            }
            await deleteProduct(id);
            onChanged();
        } catch (err) {
            alert(err.message);
        }
    };

    const cancel = () => {
        setEditing(null);
        setForm(EMPTY);
        setImageFile(null);
        setPreviewUrl('');
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
            <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>Panel Admin</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                {['dashboard', 'products', 'orders'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '0.5rem 1.5rem', borderRadius: '8px',
                            border: 'none', background: tab === t ? 'var(--text-primary)' : 'transparent',
                            color: tab === t ? 'var(--primary-bg)' : 'var(--text-secondary)',
                            fontWeight: tab === t ? '600' : '400', cursor: 'pointer',
                            fontSize: '0.9rem', textTransform: 'capitalize',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {tab === 'dashboard' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--secondary-bg)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Pesanan</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalOrders}</div>
                        </div>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--secondary-bg)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Pendapatan</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{formatPrice(stats.totalRevenue)}</div>
                        </div>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--secondary-bg)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Produk</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{products.length}</div>
                        </div>
                    </div>

                    {popular.length > 0 && (
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Produk Terlaris</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {popular.map((p, i) => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '1.5rem', fontWeight: '700', color: 'var(--text-secondary)' }}>#{i + 1}</span>
                                        <img src={p.image} alt={p.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                                        <span style={{ flex: 1, fontWeight: '500' }}>{p.name}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>{p.total_sold} terjual</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Products Tab */}
            {tab === 'products' && (
                <>
                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Kelola Produk</h2>

                    <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Nama
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Harga
                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Harga Asli
                            <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Label
                            <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Gambar Produk
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                            {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: 50, height: 65, objectFit: 'cover', borderRadius: 6, marginTop: '0.5rem' }} />}
                            {editing && !imageFile && form.image && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saat ini: {form.image.split('/').pop()}</span>
                            )}
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', gridColumn: '1 / -1' }}>
                            Deskripsi
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)', resize: 'vertical' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Ukuran (pisahkan dengan koma)
                            <input type="text" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Warna (pisahkan dengan koma)
                            <input type="text" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Navy" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            Stok
                            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" min="0" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--primary-bg)', color: 'var(--text-primary)' }} />
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                            <button type="submit" className="filter-btn active" style={{ cursor: 'pointer' }}>{editing ? 'Perbarui' : 'Tambah'}</button>
                            {editing && <button type="button" onClick={cancel} className="filter-btn" style={{ cursor: 'pointer' }}>Batal</button>}
                        </div>
                    </form>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '0.5rem' }}>Gambar</th>
                                <th style={{ padding: '0.5rem' }}>Nama</th>
                                <th style={{ padding: '0.5rem' }}>Harga</th>
                                <th style={{ padding: '0.5rem' }}>Stok</th>
                                <th style={{ padding: '0.5rem' }}>Label</th>
                                <th style={{ padding: '0.5rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}><img src={p.image} alt="" style={{ width: 50, height: 65, objectFit: 'cover', borderRadius: 6 }} /></td>
                                    <td style={{ padding: '0.5rem' }}>{p.name}</td>
                                    <td style={{ padding: '0.5rem' }}>{formatPrice(Number(p.price))}</td>
                                    <td style={{ padding: '0.5rem', color: (p.stock || 0) < 5 ? 'var(--accent-color)' : 'inherit', fontWeight: (p.stock || 0) === 0 ? '600' : '400' }}>{p.stock ?? '-'}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.badge || '-'}</td>
                                    <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => edit(p)} className="filter-btn" style={{ cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => remove(p.id)} className="filter-btn" style={{ cursor: 'pointer' }}>Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
                <>
                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Kelola Pesanan</h2>

                    {orders.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>Belum ada pesanan</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.5rem' }}>ID Pesanan</th>
                                        <th style={{ padding: '0.5rem' }}>Item</th>
                                        <th style={{ padding: '0.5rem' }}>Total</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                        <th style={{ padding: '0.5rem' }}>Tanggal</th>
                                        <th style={{ padding: '0.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.id.slice(0, 8)}...</td>
                                            <td style={{ padding: '0.5rem' }}>{(o.order_items || []).length} item</td>
                                            <td style={{ padding: '0.5rem', fontWeight: '600' }}>{formatPrice(Number(o.total))}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px',
                                                    fontSize: '0.75rem', fontWeight: '600',
                                                    background: STATUS_COLORS[o.status] || '#95a5a6',
                                                    color: '#fff',
                                                }}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                {new Date(o.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {o.status === 'pending' && (
                                                    <button onClick={() => handleConfirm(o.id)} className="filter-btn active" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                                                        <i className="fas fa-check" style={{ marginRight: '0.3rem' }}></i>Konfirmasi
                                                    </button>
                                                )}
                                                {['confirmed', 'shipped'].includes(o.status) && (
                                                    <select
                                                        value={o.status}
                                                        onChange={e => handleStatusChange(o.id, e.target.value)}
                                                        style={{
                                                            padding: '0.3rem 0.5rem', borderRadius: '6px',
                                                            border: '1px solid var(--border-color)',
                                                            background: 'var(--primary-bg)', color: 'var(--text-primary)',
                                                            fontSize: '0.8rem', cursor: 'pointer',
                                                        }}
                                                    >
                                                        <option value="confirmed">Dikonfirmasi</option>
                                                        <option value="shipped">Dikirim</option>
                                                        <option value="completed">Selesai</option>
                                                        <option value="cancelled">Dibatalkan</option>
                                                    </select>
                                                )}
                                                {o.status === 'completed' && <span style={{ color: '#2ecc71', fontSize: '0.8rem' }}>Selesai</span>}
                                                {o.status === 'cancelled' && <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>Dibatalkan</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
