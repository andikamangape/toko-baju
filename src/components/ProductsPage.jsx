import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useInfiniteScroll from '../hooks/useInfiniteScroll.js';
import { ProductGridSkeleton } from './Skeleton.jsx';

const PAGE_SIZE = 12;

export default function ProductsPage({ products, productsLoading, addToCart, selectedFilter, setSelectedFilter }) {
    const filters = ['all', 'jackets', 'tops', 'outerwear'];
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(12);

    const filteredProducts = useMemo(() =>
        products.filter(p => {
            const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = selectedFilter === 'all' || p.name.toLowerCase().includes(selectedFilter.toLowerCase());
            return matchesSearch && matchesFilter;
        }),
        [products, searchQuery, selectedFilter]
    );

    const hasMore = visibleCount < filteredProducts.length;
    const loadMore = useCallback(() => setVisibleCount(prev => prev + 12), []);
    const sentinelRef = useInfiniteScroll(loadMore, { enabled: hasMore });
    const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

    return (
        <div className="products-section">
            <div className="section-header">
                <h1 className="section-title">Products</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Discover our curated collection of premium fashion pieces</p>

                <div style={{ position: 'relative', maxWidth: '400px', width: '100%', margin: '1rem auto 0' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '40px',
                            border: '1px solid var(--border-color)', background: 'var(--secondary-bg)',
                            color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.85rem',
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                <div className="filter-bar">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                            onClick={() => setSelectedFilter(filter)}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {productsLoading ? (
                <ProductGridSkeleton count={6} />
            ) : (
                <>
                <div className="products-grid">
                    {filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                            <i className="fas fa-search" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                            <p style={{ fontSize: '1.1rem' }}>No products found</p>
                            {searchQuery && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try a different search term</p>}
                        </div>
                    ) : (
                        visibleProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAddToCart={addToCart} 
                            />
                        ))
                    )}
                </div>
                <div ref={sentinelRef} style={{ height: 1 }}></div>
                </>
            )}
        </div>
    );
}

function ProductCard({ product, onAddToCart }) {
    const stock = product.stock || 0;
    const outOfStock = stock === 0;
    const lowStock = stock > 0 && stock < 5;
    const handleAction = (fn) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn();
    };
    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="product-image-wrapper">
                    <img src={product.image} alt={product.name} className="product-image" style={{ opacity: outOfStock ? 0.5 : 1 }} />
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    {outOfStock && (
                        <span style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.5rem 1.2rem',
                            borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                            letterSpacing: '0.5px', whiteSpace: 'nowrap',
                        }}>
                            Out of Stock
                        </span>
                    )}
                    {lowStock && (
                        <span style={{
                            position: 'absolute', bottom: '12px', left: '12px',
                            background: 'var(--accent-color)', color: '#fff',
                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem',
                        }}>
                            Only {stock} left
                        </span>
                    )}
                    <div className="product-actions" onClick={e => e.stopPropagation()}>
                        <button
                            className="action-btn"
                            onClick={handleAction(() => onAddToCart(product))}
                            style={{ opacity: outOfStock ? 0.4 : 1 }}
                            disabled={outOfStock}
                        >
                            <i className="fas fa-shopping-bag"></i>
                        </button>
                        <Link to={`/product/${product.id}`} className="action-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <i className="fas fa-eye"></i>
                        </Link>
                    </div>
                </div>
            </Link>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                        ${product.price.toFixed(2)}
                        {product.originalPrice && (
                            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
