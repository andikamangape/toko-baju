import { useEffect, useRef, useCallback } from 'react';

export default function useInfiniteScroll(callback, { enabled = true, threshold = 200 } = {}) {
    const sentinelRef = useRef(null);

    const handleIntersect = useCallback((entries) => {
        if (entries[0].isIntersecting && enabled) callback();
    }, [callback, enabled]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleIntersect, {
            rootMargin: `${threshold}px`,
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleIntersect, threshold]);

    return sentinelRef;
}
