import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { CreditCard, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', username: '', first_name: '', last_name: '', phone: '', password: '', password2: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const { data } = await authAPI.register(form);
            login(data.tokens, data.user);
            navigate('/dashboard');
        } catch (err) {
            setErrors(err.response?.data || { non_field_errors: ['Registration failed.'] });
        } finally {
            setLoading(false);
        }
    };

    const inp = (name) => ({
        width: '100%', padding: '10px 14px', borderRadius: 8,
        border: `1px solid ${errors[name] ? '#fca5a5' : 'var(--border)'}`,
        background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', marginTop: 4,
    });
    const lbl = { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block' };
    const fieldErr = (name) => errors[name] && <p style={{ color: '#ef4444', fontSize: 12, margin: '2px 0 0' }}>{errors[name][0]}</p>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 40, width: '100%', maxWidth: 460, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <CreditCard size={26} color="white" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Create Account</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Start managing your cards securely</p>
                </div>

                {errors.non_field_errors && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                        {errors.non_field_errors[0]}
                    </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={lbl}>First Name</label>
                            <input style={inp('first_name')} name="first_name" value={form.first_name} onChange={handle} placeholder="John" />
                            {fieldErr('first_name')}
                        </div>
                        <div>
                            <label style={lbl}>Last Name</label>
                            <input style={inp('last_name')} name="last_name" value={form.last_name} onChange={handle} placeholder="Doe" />
                            {fieldErr('last_name')}
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Email address</label>
                        <input style={inp('email')} name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
                        {fieldErr('email')}
                    </div>
                    <div>
                        <label style={lbl}>Username</label>
                        <input style={inp('username')} name="username" value={form.username} onChange={handle} placeholder="johndoe" required />
                        {fieldErr('username')}
                    </div>
                    <div>
                        <label style={lbl}>Phone (optional)</label>
                        <input style={inp('phone')} name="phone" value={form.phone} onChange={handle} placeholder="+91 9999999999" />
                    </div>
                    <div>
                        <label style={lbl}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input style={{ ...inp('password'), paddingRight: 42 }} name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Min. 8 characters" required />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', paddingTop: 4 }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {fieldErr('password')}
                    </div>
                    <div>
                        <label style={lbl}>Confirm Password</label>
                        <input style={inp('password2')} name="password2" type={showPass ? 'text' : 'password'} value={form.password2} onChange={handle} placeholder="Repeat password" required />
                        {fieldErr('password2')}
                    </div>
                    <button type="submit" disabled={loading} style={{
                        marginTop: 6, padding: '12px', borderRadius: 8, border: 'none',
                        background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
