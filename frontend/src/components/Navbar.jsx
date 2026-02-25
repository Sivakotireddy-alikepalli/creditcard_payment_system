import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, CreditCard, LogOut, LayoutDashboard, History, Settings } from 'lucide-react';

export default function Navbar() {
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        color: isActive(path) ? '#6366f1' : 'var(--text-muted)',
        background: isActive(path) ? (theme === 'dark' ? 'rgba(99,102,241,0.15)' : '#ede9fe') : 'transparent',
        transition: 'all 0.2s',
    });

    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={20} color="#6366f1" />
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Credit Card Manager</span>
                </Link>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Link to="/dashboard" style={linkStyle('/dashboard')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <LayoutDashboard size={14} /> Dashboard
                            </span>
                        </Link>
                        <Link to="/cards" style={linkStyle('/cards')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CreditCard size={14} /> Cards
                            </span>
                        </Link>
                        <Link to="/transactions" style={linkStyle('/transactions')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <History size={14} /> History
                            </span>
                        </Link>
                        {user.is_admin && (
                            <Link to="/admin" style={linkStyle('/admin')}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Settings size={14} /> Admin
                                </span>
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={toggleTheme} style={{
                    width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
                    background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', transition: 'all 0.2s',
                }}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {user && (
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        borderRadius: 8, border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    }}>
                        <LogOut size={14} /> Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
