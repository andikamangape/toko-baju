import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getProducts } from './lib/products.js';
import { getMyCart, addToCart as dbAddToCart, removeFromCart as dbRemoveFromCart, clearCart as dbClearCart } from './lib/cart.js';
import { useAuth } from './hooks/useAuth.js';
import WelcomePage from './components/WelcomePage.jsx';
import Navbar from './components/Navbar.jsx';
import HomePage from './components/HomePage.jsx';
import ProductsPage from './components/ProductsPage.jsx';
import AdminPage from './components/AdminPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import ProductDetailPage from './components/ProductDetailPage.jsx';
import CheckoutPage from './components/CheckoutPage.jsx';
import AuthPage from './components/AuthPage.jsx';
import AccountPage from './components/AccountPage.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';

function Layout({ children, darkMode, setDarkMode, cartCount, user }) {
    const location = useLocation();
    const isWelcome = location.pathname === '/';

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    return (
        <>
            {!isWelcome && (
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} cartCount={cartCount} user={user} />
            )}
            {children}
            {!isWelcome && <Footer />}
        </>
    );
}

export default function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [cart, setCart] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            getMyCart().then(setCart).catch(console.error);
        } else {
            setCart([]);
        }
    }, [user]);

    const loadProducts = async () => {
        try {
            setProductsLoading(true);
            setProducts(await getProducts());
        } catch (e) {
            console.error('loadProducts failed:', e);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const addToCart = useCallback((product) => {
        const stock = product.stock || 0;
        if (stock === 0) {
            showToastMessage(`${product.name} stok habis`);
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            const currentQty = existing ? (existing.quantity || 1) : 0;
            if (currentQty >= stock) {
                setTimeout(() => showToastMessage(`Hanya ${stock} item tersedia untuk ${product.name}`), 0);
                return prev;
            }
            if (user) setTimeout(() => dbAddToCart(product.id).catch(console.error), 0);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: currentQty + 1, stock } : item
                );
            }
            return [...prev, { ...product, quantity: 1, stock }];
        });
    }, [user]);

    const removeFromCart = useCallback((productId) => {
        if (user) dbRemoveFromCart(productId).catch(console.error);
        setCart(prev => prev.filter(item => item.id !== productId));
    }, [user]);

    const clearCart = useCallback(() => {
        setCart([]);
        if (user) dbClearCart().catch(console.error);
    }, [user]);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="*" element={
                    <Layout darkMode={darkMode} setDarkMode={setDarkMode} cartCount={cart.length} user={user}>
                        <Routes>
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/products" element={
                                <ProductsPage
                                    products={products}
                                    productsLoading={productsLoading}
                                    addToCart={addToCart}
                                    selectedFilter={selectedFilter}
                                    setSelectedFilter={setSelectedFilter}
                                />
                            } />
                            <Route path="/admin" element={
                                <RequireAdmin>
                                    <AdminPage products={products} onChanged={loadProducts} />
                                </RequireAdmin>
                            } />
                            <Route path="/product/:id" element={
                                <ProductDetailPage addToCart={addToCart} user={user} />
                            } />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/checkout" element={
                                <CheckoutPage
                                    cart={cart}
                                    removeFromCart={removeFromCart}
                                    showToastMessage={showToastMessage}
                                    clearCart={clearCart}
                                    user={user}
                                />
                            } />
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/account" element={<AccountPage />} />
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
            <Toast show={showToast} message={toastMessage} />
        </>
    );
}
