import { supabase } from './supabase.js';

export async function getMyCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('cart_items')
        .select('quantity, products(*)')
        .eq('user_id', user.id);
    if (error) throw error;
    return (data ?? []).map((c) => ({
        id: c.products.id,
        name: c.products.name,
        price: parseFloat(c.products.price),
        original_price: c.products.original_price ? parseFloat(c.products.original_price) : null,
        badge: c.products.badge,
        image: c.products.image,
        stock: c.products.stock || 0,
        quantity: c.quantity,
    }));
}

export async function addToCart(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
    if (existing) {
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (error) throw error;
    }
}

export async function removeFromCart(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    if (error) throw error;
}

export async function clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    if (error) throw error;
}
