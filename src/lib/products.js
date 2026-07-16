import { supabase } from './supabase.js';

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function addProduct(p) {
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: p.name,
            price: p.price,
            original_price: p.originalPrice,
            badge: p.badge,
            image: p.image,
            description: p.description || '',
            sizes: p.sizes || ['S','M','L','XL'],
            colors: p.colors || ['Black','White','Navy'],
            stock: p.stock || 0,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateProduct(id, p) {
    const { error } = await supabase
        .from('products')
        .update({
            name: p.name,
            price: p.price,
            original_price: p.originalPrice,
            badge: p.badge,
            image: p.image,
            description: p.description || '',
            sizes: p.sizes || ['S','M','L','XL'],
            colors: p.colors || ['Black','White','Navy'],
            stock: p.stock || 0,
        })
        .eq('id', id);
    if (error) throw error;
}

export async function deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
}

export async function getLowStockProducts(threshold = 5) {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, image, stock, badge')
        .lt('stock', threshold)
        .order('stock', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function decrementStock(productId, qty) {
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
    if (fetchError) throw fetchError;
    const newStock = Math.max(0, (product.stock || 0) - qty);
    const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
    if (updateError) throw updateError;
}
