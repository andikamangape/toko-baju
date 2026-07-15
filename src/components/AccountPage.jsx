import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getMyOrders } from '../lib/orders.js';
import { OrderSkeleton, SkeletonBox } from './Skeleton.jsx';
import { formatPrice } from '../lib/format.js';

const STATUS_COLORS = {
    pending: '#f39c12', confirmed: '#3498db', shipped: '#9b59b6', completed: '#2ecc71', cancelled: '#e74c3c',
};

export default function AccountPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        getMyOrders()
            .then(setOrders)
            .catch(err => alert(err.message))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    if (loading) {
        return (
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
                <SkeletonBox style={{ height: 32, width: '40%', marginBottom: '0.5rem' }} />
                <SkeletonBox style={{ height: 16, width: '60%', marginBottom: '2rem' }} />
                <SkeletonBox style={{ height: 24, width: '30%', marginBottom: '1rem' }} />
                <OrderSkeleton count={3} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>My Account</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{user.email}</p>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Order History</h2>
            {orders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Belum ada pesanan.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {orders.map(o => (
                        <div key={o.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>#{o.id.slice(0, 8)}</strong>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(o.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {o.order_items?.length ?? 0} item(s) · {formatPrice(Number(o.total))}
                                <span style={{
                                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px',
                                    fontSize: '0.75rem', fontWeight: '600',
                                    background: STATUS_COLORS[o.status] || '#95a5a6', color: '#fff',
                                }}>
                                    {o.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
