import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../lib/products.js';
import { ProductDetailSkeleton } from './Skeleton.jsx';
import { formatPrice } from '../lib/format.js';

const COLOR_MAP = {
    'Black': '#000000', 'White': '#FFFFFF', 'Navy': '#000080',
    'Olive': '#808000', 'Charcoal': '#36454F', 'Camel': '#C19A6B',
    'Burgundy': '#800020', 'Blush': '#DE5D83', 'Sky Blue': '#87CEEB',
    'Army Green': '#4B5320', 'Cream': '#FFFDD0', 'Heather Gray': '#B6B6B4',
    'Light Wash': '#B0C4DE', 'Medium Wash': '#6495ED',
    'Multi': 'linear-gradient(135deg, red, orange, yellow, green, blue, purple)',
    'Black Floral': '#1a1a1a',
};

function parseColors(colors) {
    if (!colors) return [];
    if (typeof colors === 'string') {
        try { return JSON.parse(colors); }
        catch { return [colors]; }
    }
    return colors;
}

function parseSizes(sizes) {
    if (!sizes) return [];
    if (typeof sizes === 'string') {
        try { return JSON.parse(sizes); }
        catch { return [sizes]; }
    }
    return sizes;
}

export default function ProductDetailPage({ addToCart, user }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setLoading(true);
        getProductById(id)
            .then(p => {
                setProduct(p);
                if (p) {
                    const sizes = parseSizes(p.sizes);
                    const colors = parseColors(p.colors);
                    setSelectedSize(sizes[0] || null);
                    setSelectedColor(colors[0] || null);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return (
            <div className="checkout-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '4rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                <h2 style={{ marginBottom: '1rem' }}>Produk tidak ditemukan</h2>
                <Link to="/products" style={{ color: 'var(--accent-color)' }}>Kembali ke produk</Link>
            </div>
        );
    }

    const sizes = parseSizes(product.sizes);
    const colors = parseColors(product.colors);
    const colorVal = (name) => COLOR_MAP[name] || '#cccccc';

    return (
        <div className="checkout-container" style={{ paddingTop: '2rem' }}>
            <Link to="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <i className="fas fa-arrow-left"></i> Kembali ke Produk
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                {/* Image */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'cover', borderRadius: '16px' }}
                    />
                    {product.badge && (
                        <span style={{
                            position: 'absolute', top: '1rem', left: '1rem',
                            background: product.badge === 'Sale' ? 'var(--accent-color)' : '#1a1a1a',
                            color: '#fff', padding: '0.35rem 0.9rem', borderRadius: '20px',
                            fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px'
                        }}>
                            {product.badge}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '700' }}>{formatPrice(Number(product.price))}</span>
                        {product.original_price && (
                            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                {formatPrice(Number(product.original_price))}
                            </span>
                        )}
                    </div>

                    {/* Size */}
                    {sizes.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Ukuran</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {sizes.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        style={{
                                            padding: '0.5rem 1.2rem', border: selectedSize === s ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                                            borderRadius: '8px', background: selectedSize === s ? 'var(--text-primary)' : 'var(--primary-bg)',
                                            color: selectedSize === s ? 'var(--primary-bg)' : 'var(--text-primary)',
                                            cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {colors.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Warna <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>{selectedColor}</span>
                            </h4>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        title={c}
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            border: selectedColor === c ? '3px solid var(--text-primary)' : '2px solid var(--border-color)',
                                            background: colorVal(c),
                                            cursor: 'pointer', position: 'relative',
                                            outline: selectedColor === c ? '3px solid var(--text-primary)' : 'none',
                                            outlineOffset: '2px',
                                        }}
                                    >
                                        {c === 'White' && (
                                            <span style={{ position: 'absolute', inset: 0, border: '1px solid var(--border-color)', borderRadius: '50%' }}></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock status */}
                    <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {(product.stock || 0) > 0 ? (
                            <span style={{ color: '#2ecc71', fontWeight: '600' }}>
                                <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
                                Stok Tersedia ({product.stock} tersedia)
                            </span>
                        ) : (
                            <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                                <i className="fas fa-times-circle" style={{ marginRight: '0.5rem' }}></i>
                                Stok Habis
                            </span>
                        )}
                    </div>

                    {/* Quantity */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Jumlah</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', background: 'var(--primary-bg)',
                                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: quantity <= 1 ? 0.4 : 1,
                                }}
                            >
                                <i className="fas fa-minus"></i>
                            </button>
                            <span style={{ fontSize: '1.2rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(product.stock || 0, q + 1))}
                                disabled={quantity >= (product.stock || 0)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', background: 'var(--primary-bg)',
                                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: quantity >= (product.stock || 0) ? 0.4 : 1,
                                }}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!product.stock}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '12px',
                            background: product.stock ? 'var(--text-primary)' : 'var(--text-secondary)',
                            color: 'var(--primary-bg)',
                            border: 'none', fontSize: '1rem', fontWeight: '600',
                            cursor: product.stock ? 'pointer' : 'not-allowed',
                            marginBottom: '2rem', transition: 'opacity 0.2s',
                            opacity: product.stock ? 1 : 0.5,
                        }}
                        onMouseOver={e => product.stock && (e.target.style.opacity = '0.85')}
                        onMouseOut={e => product.stock && (e.target.style.opacity = '1')}
                    >
                        <i className="fas fa-shopping-bag" style={{ marginRight: '0.75rem' }}></i>
                        {product.stock ? `Tambah ke Keranjang — ${formatPrice(Number(product.price) * quantity)}` : 'Stok Habis'}
                    </button>

                    {/* Description */}
                    {product.description && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Deskripsi</h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>{product.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
