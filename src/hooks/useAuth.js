import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

async function loadIsAdmin(uid) {
    if (!uid) return false;
    const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', uid)
        .single();
    return data?.is_admin ?? false;
}

export function useAuth() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            const u = data.session?.user ?? null;
            setUser(u);
            setIsAdmin(await loadIsAdmin(u?.id));
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
            const u = session?.user ?? null;
            setUser(u);
            setIsAdmin(await loadIsAdmin(u?.id));
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const signUp = (email, password, fullName) =>
        supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signOut = () => supabase.auth.signOut();

    return { user, isAdmin, loading, signUp, signIn, signOut };
}
