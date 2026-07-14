import { supabase } from './supabase.js';

export async function uploadProductImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function deleteProductImage(url) {
    if (!url) return;
    const path = url.split('/products/')[1];
    if (!path) return;

    await supabase.storage
        .from('products')
        .remove([path]);
}
