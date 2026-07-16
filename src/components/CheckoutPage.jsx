import React, { useState } from 'react';
import { ADDRESS_SUGGESTIONS, SHIPPING_OPTIONS } from '../data.js';
import { createOrder } from '../lib/orders.js';
import { formatPrice } from '../lib/format.js';

export default function CheckoutPage({ cart, removeFromCart, showToastMessage, clearCart, user }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState('standard');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shippingCost = SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.price || 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (field === 'address') {
            setShowSuggestions(value.length > 2);
        }
    };

    const selectSuggestion = (address) => {
        setFormData({ ...formData, address });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const order = await createOrder({ cart, address: formData, userId: user?.id || null, total });
            const shippingMethod = SHIPPING_OPTIONS.find(s => s.id === selectedShipping);
            const itemsText = cart.map((item, i) =>
                `${i + 1}. ${item.name} (x${item.quantity || 1}) - ${formatPrice(item.price * (item.quantity || 1))}`
            ).join('\n');

            const message = `Halo, saya ingin memesan:

Order ID: ${order.id}
Nama: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Telepon: ${formData.phone}

Pesanan:
${itemsText}

Subtotal: ${formatPrice(subtotal)}
Ongkos Kirim (${shippingMethod.name}): ${formatPrice(shippingCost)}
Total: ${formatPrice(total)}

Alamat Pengiriman:
${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;

            const waNumber = import.meta.env.VITE_WA_NUMBER || '6281234567890';
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');

            showToastMessage('Pesanan berhasil! Silakan konfirmasi via WhatsApp.');
            clearCart();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <i className="fas fa-shopping-bag" style={{ fontSize: '4rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                <h2 style={{ marginBottom: '1rem' }}>Keranjang Anda Kosong</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Tambahkan beberapa item ke keranjang sebelum melanjutkan ke checkout</p>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>Checkout</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Lengkapi pesanan Anda dalam beberapa langkah sederhana</p>

            <div className="checkout-grid">
                <form onSubmit={handleSubmit}>
                    {/* Contact Information */}
                    <div className="checkout-form" style={{ marginBottom: '2rem' }}>
                        <div className="form-section">
                            <h3 className="form-title"><span className="step-number">1</span>Informasi Kontak</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nama Depan</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nama Belakang</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Telepon</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        required
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="form-section">
                            <h3 className="form-title"><span className="step-number">2</span>Alamat Pengiriman</h3>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label className="form-label">Alamat Jalan</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    onFocus={() => formData.address.length > 2 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && (
                                    <div className="address-suggestions">
                                        {ADDRESS_SUGGESTIONS
                                            .filter(addr => addr.toLowerCase().includes(formData.address.toLowerCase()))
                                            .map((addr, idx) => (
                                                <div
                                                    key={idx}
                                                    className="suggestion-item"
                                                    onClick={() => selectSuggestion(addr)}
                                                >
                                                    <i className="fas fa-map-marker-alt" style={{ marginRight: '0.75rem', color: 'var(--accent-color)' }}></i>
                                                    {addr}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Kota</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Provinsi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kode POS</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                />
                            </div>
                        </div>

    
                    </div>
                </form>

                {/* Order Summary */}
                <div className="order-summary">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Ringkasan Pesanan</h3>

                    <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
                        {cart.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="summary-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Jml: {item.quantity || 1}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontWeight: '600' }}>{formatPrice(item.price * (item.quantity || 1))}</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-color)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="shipping-calculator">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem' }}>Metode Pengiriman</h4>
                        {SHIPPING_OPTIONS.map(option => (
                            <div
                                key={option.id}
                                className={`shipping-option ${selectedShipping === option.id ? 'selected' : ''}`}
                                onClick={() => setSelectedShipping(option.id)}
                            >
                                <div className="radio-custom"></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{option.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{option.days}</div>
                                </div>
                                <div style={{ fontWeight: '600' }}>{formatPrice(option.price)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="summary-item">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Ongkos Kirim</span>
                        <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Pajak (8%)</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>

                    <button
                        className="checkout-btn"
                        onClick={handleSubmit}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                <span className="loading-spinner"></span>
                                Memproses...
                            </span>
                        ) : (
                            'Pesan via WhatsApp'
                        )}
                    </button>

                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        marginTop: '1rem'
                    }}>
                        <i className="fab fa-whatsapp" style={{ marginRight: '0.5rem' }}></i>
                        Pesanan akan dikonfirmasi via WhatsApp
                    </p>
                </div>
            </div>
        </div>
    );
}
