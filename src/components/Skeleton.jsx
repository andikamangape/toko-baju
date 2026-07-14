export function SkeletonBox({ className = '', style = {} }) {
    return <div className={`skeleton ${className}`} style={style}></div>;
}

export function ProductCardSkeleton() {
    return (
        <div className="skeleton-card">
            <SkeletonBox className="skeleton-card-img" />
            <div className="skeleton-card-text">
                <SkeletonBox className="skeleton-text" />
                <SkeletonBox className="skeleton-text shorter" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 6 }) {
    return (
        <div className="products-grid">
            {Array.from({ length: count }, (_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="checkout-container" style={{ paddingTop: '2rem' }}>
            <SkeletonBox style={{ height: 18, width: 150, marginBottom: '2rem' }} />
            <div className="skeleton-detail">
                <SkeletonBox className="skeleton-detail-img" />
                <div className="skeleton-detail-body">
                    <SkeletonBox className="skeleton-detail-title" />
                    <SkeletonBox className="skeleton-detail-price" />
                    <SkeletonBox className="skeleton-detail-section" />
                    <SkeletonBox className="skeleton-detail-section" />
                    <SkeletonBox className="skeleton-detail-btn" />
                    <SkeletonBox className="skeleton-detail-desc" />
                </div>
            </div>
        </div>
    );
}

export function OrderSkeleton({ count = 3 }) {
    return (
        <div>
            {Array.from({ length: count }, (_, i) => (
                <SkeletonBox key={i} className="skeleton-order" />
            ))}
        </div>
    );
}
