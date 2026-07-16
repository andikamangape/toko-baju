import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 className="footer-brand brand-font">DOWLING</h2>
                <div className="footer-content">
                    <div className="footer-column">
                        <h4>Belanja</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">Semua Produk</Link></li>
                            <li><Link to="/products">Produk Baru</Link></li>
                            <li><Link to="/products">Terlaris</Link></li>
                            <li><Link to="/products">Diskon</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Perusahaan</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">Tentang Kami</Link></li>
                            <li><Link to="/about">Karir</Link></li>
                            <li><Link to="/about">Pers</Link></li>
                            <li><Link to="/about">Keberlanjutan</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Dukungan</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">Hubungi Kami</Link></li>
                            <li><Link to="/about">FAQs</Link></li>
                            <li><Link to="/about">Info Pengiriman</Link></li>
                            <li><Link to="/about">Pengembalian</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Ikuti Kami</h4>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <a href="#" style={{ color: '#888', fontSize: '1.25rem', transition: 'color 0.3s' }}
                               onMouseEnter={(e) => e.target.style.color = 'white'}
                               onMouseLeave={(e) => e.target.style.color = '#888'}>
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" style={{ color: '#888', fontSize: '1.25rem', transition: 'color 0.3s' }}
                               onMouseEnter={(e) => e.target.style.color = 'white'}
                               onMouseLeave={(e) => e.target.style.color = '#888'}>
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="#" style={{ color: '#888', fontSize: '1.25rem', transition: 'color 0.3s' }}
                               onMouseEnter={(e) => e.target.style.color = 'white'}
                               onMouseLeave={(e) => e.target.style.color = '#888'}>
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" style={{ color: '#888', fontSize: '1.25rem', transition: 'color 0.3s' }}
                               onMouseEnter={(e) => e.target.style.color = 'white'}
                               onMouseLeave={(e) => e.target.style.color = '#888'}>
                                <i className="fab fa-pinterest"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div style={{
                    borderTop: '1px solid #333',
                    marginTop: '3rem',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '0.9rem'
                }}>
                    © 2026 DOWLING. dibuat dengan cinta🫶🏼.
                </div>
            </div>
        </footer>
    );
}
