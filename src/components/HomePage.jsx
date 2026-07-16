import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                height: '80vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)'
                }}></div>
                <div style={{ zIndex: 10, textAlign: 'left', maxWidth: '600px', padding: '2rem', color: 'white' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>
                        Temukan Gaya Signature-mu
                    </h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Koleksi kurasi untuk individu modern yang menghargai kualitas dan keanggunan.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            padding: '1rem 2.5rem',
                            background: 'white',
                            color: '#1a1a1a',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Belanja Sekarang
                    </button>
                </div>
            </section>

            {/* Featured Categories */}
            <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', fontFamily: 'Playfair Display, serif' }}>
                    Belanja per Kategori
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[
                        { title: 'Jaket & Outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop' },
                        { title: 'Atasan & Kemeja', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=400&fit=crop' },
                        { title: 'Aksesoris', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=400&fit=crop' },
                    ].map((cat, idx) => (
                        <div key={idx} style={{
                            position: 'relative',
                            height: '350px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onClick={() => navigate('/products')}
                        >
                            <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '1.5rem'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>{cat.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
