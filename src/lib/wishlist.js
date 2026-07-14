import { supabase } from './supabase.js';

export async function getMyWishlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
    if (error) throw error;
    return (data ?? []).map((w) => w.product_id);
}

export async function toggleWishlist(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Login dulu untuk wishlist');
    const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
    if (existing) {
        await supabase.from('wishlist').delete().eq('id', existing.id);
        return false;
    }
    await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
    return true;
}
