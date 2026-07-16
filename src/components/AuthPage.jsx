import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function AuthPage() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = mode === 'login'
                ? await signIn(email, password)
                : await signUp(email, password, fullName);
            if (res.error) throw res.error;
            if (mode === 'signup' && res.data.session === null) {
                setError('Cek email untuk verifikasi akun.');
                return;
            }
            navigate('/account');
        } catch (err) {
            setError(err.message);
        }
    };

    const inputStyle = {
        padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)',
        background: 'var(--primary-bg)', color: 'var(--text-primary)', width: '100%'
    };

    return (
        <div style={{ maxWidth: 420, margin: '4rem auto', padding: '0 1.5rem' }}>
            <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>
                {mode === 'login' ? 'Masuk' : 'Daftar'}
            </h1>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mode === 'signup' && (
                    <input style={inputStyle} placeholder="Nama Lengkap" value={fullName}
                        onChange={e => setFullName(e.target.value)} required />
                )}
                <input style={inputStyle} type="email" placeholder="Email" value={email}
                    onChange={e => setEmail(e.target.value)} required />
                <input style={inputStyle} type="password" placeholder="Kata Sandi" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6} />

                {error && <p style={{ color: '#ff4757', fontSize: '0.9rem' }}>{error}</p>}

                <button type="submit" className="checkout-btn" style={{ marginTop: '0.5rem' }}>
                    {mode === 'login' ? 'Masuk' : 'Daftar'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <a href="#" style={{ color: 'var(--accent-color)' }}
                    onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
                    {mode === 'login' ? 'Daftar' : 'Masuk'}
                </a>
            </p>
        </div>
    );
}
