import { supabase } from './supabase.js';
import { decrementStock } from './products.js';

export async function createOrder({ cart, address, userId, total }) {
    const orderId = crypto.randomUUID();
    const { error } = await supabase
        .from('orders')
        .insert({ id: orderId, user_id: userId, total, shipping_address: address, status: 'pending' });
    if (error) throw error;

    const items = cart.map((i) => ({
        order_id: orderId,
        product_id: i.id,
        name: i.name,
        price: i.price,
        qty: i.quantity || 1,
    }));
    const { error: itemError } = await supabase.from('order_items').insert(items);
    if (itemError) throw itemError;

    return { id: orderId };
}

export async function getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function getAllOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function updateOrderStatus(orderId, status) {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
    if (error) throw error;
}

export async function confirmOrder(orderId) {
    await updateOrderStatus(orderId, 'confirmed');
    const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id, qty')
        .eq('order_id', orderId);
    if (itemsErr) throw itemsErr;
    await Promise.all(items.map(i => decrementStock(i.product_id, i.qty)));
}

export async function getDashboardStats() {
    const { data: orders, error: ordErr } = await supabase.from('orders').select('total');
    if (ordErr) throw ordErr;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((s, o) => s + Number(o.total), 0) || 0;
    return { totalOrders, totalRevenue };
}

export async function getOrdersInRange(start, end) {
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (start) query = query.gte('created_at', start.toISOString());
    if (end) query = query.lte('created_at', end.toISOString());
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function getPopularProducts() {
    const { data, error } = await supabase.from('popular_products').select('*').limit(5);
    if (error) throw error;
    return data ?? [];
}
