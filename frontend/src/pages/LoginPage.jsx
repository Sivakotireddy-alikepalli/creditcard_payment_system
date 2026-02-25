import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { CreditCard, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authAPI.login(form);
            // Fetch profile for user claims
            localStorage.setItem('access_token', data.access);
            const profile = await authAPI.profile();
            login({ access: data.access, refresh: data.refresh }, profile.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inp = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', marginTop: 4 };
    const lbl = { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block' };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <CreditCard size={26} color="white" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Welcome back</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={lbl}>Email</label>
                        <input style={inp} name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label style={lbl}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input style={{ ...inp, paddingRight: 42 }} name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="••••••••" required />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', paddingTop: 4 }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{
                        marginTop: 4, padding: '12px', borderRadius: 8, border: 'none',
                        background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                    }}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    Admin: <strong>admin@creditcard.com</strong> / <strong>Admin@123456</strong>
                </p>
            </div>
        </div>
    );
}
