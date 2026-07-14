import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Navbar({ darkMode, setDarkMode, cartCount, user }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const getLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

    const closeMobile = () => setMobileMenuOpen(false);

    const handleSignOut = async () => {
        await signOut();
        closeMobile();
        navigate('/home');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/home" className="nav-logo brand-font">
                    VALORE
                </NavLink>

                <ul className="nav-links">
                    <li><NavLink to="/home" className={getLinkClass}>Home</NavLink></li>
                    <li><NavLink to="/products" className={getLinkClass}>Products</NavLink></li>
                    <li><NavLink to="/about" className={getLinkClass}>About Brand</NavLink></li>
                    <li><NavLink to="/checkout" className={getLinkClass}>Checkout</NavLink></li>
                    {isAdmin && <li><NavLink to="/admin" className={getLinkClass}>Admin</NavLink></li>}
                </ul>

                <div className="nav-actions">
                    <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
                        <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
                    </button>
                    <NavLink to="/checkout" className="icon-btn">
                        <i className="fas fa-shopping-bag"></i>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </NavLink>
                    {user ? (
                        <button className="icon-btn" onClick={handleSignOut} title="Sign out">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    ) : (
                        <NavLink to="/login" className="icon-btn" title="Login">
                            <i className="fas fa-user"></i>
                        </NavLink>
                    )}
                    <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--primary-bg)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '1rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <NavLink to="/home" className="nav-link" onClick={closeMobile}>Home</NavLink>
                    <NavLink to="/products" className="nav-link" onClick={closeMobile}>Products</NavLink>
                    <NavLink to="/about" className="nav-link" onClick={closeMobile}>About Brand</NavLink>
                    <NavLink to="/checkout" className="nav-link" onClick={closeMobile}>Checkout</NavLink>
                    {isAdmin && <NavLink to="/admin" className="nav-link" onClick={closeMobile}>Admin</NavLink>}
                </div>
            )}
        </nav>
    );
}
