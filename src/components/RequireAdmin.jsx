import { useAuth } from '../hooks/useAuth.js';
import { Navigate } from 'react-router-dom';
import { SkeletonBox } from './Skeleton.jsx';

export default function RequireAdmin({ children }) {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
            <SkeletonBox style={{ height: 32, width: '30%', marginBottom: '1rem' }} />
            <SkeletonBox style={{ height: 200, width: '100%', marginBottom: '1rem' }} />
            <SkeletonBox style={{ height: 60, width: '100%' }} />
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/home" replace />;
    return children;
}
