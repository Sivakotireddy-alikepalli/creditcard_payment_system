import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { Users, CreditCard, Activity, Download, TrendingUp, BarChart3 } from 'lucide-react';

const TabBtn = ({ label, active, onClick, icon: Icon }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8,
        border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
        background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-muted)',
        boxShadow: active ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
        border: active ? 'none' : '1px solid var(--border)',
    }}>
        <Icon size={14} /> {label}
    </button>
);

const statusBadge = (status) => {
    const s = { SUCCESS: { bg: '#d1fae5', color: '#059669' }, FAILED: { bg: '#fee2e2', color: '#dc2626' }, PENDING: { bg: '#fef3c7', color: '#d97706' } };
    const style = s[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return <span style={{ background: style.bg, color: style.color, padding: '2px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>{status}</span>;
};

export default function AdminDashboardPage() {
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        if (tab === 'users') adminAPI.users().then(r => setUsers(r.data.results || r.data)).finally(() => setLoading(false));
        if (tab === 'cards') adminAPI.cards().then(r => setCards(r.data.results || r.data)).finally(() => setLoading(false));
        if (tab === 'transactions') adminAPI.transactions().then(r => setTransactions(r.data.results || r.data)).finally(() => setLoading(false));
        if (tab === 'summary') adminAPI.dailySummary().then(r => setSummary(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [tab]);

    const exportCSV = async () => {
        const { data } = await adminAPI.exportCSV();
        const url = window.URL.createObjectURL(new Blob([data]));
        const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    };

    const toggleAdmin = async (user) => {
        await adminAPI.updateUser(user.id, { is_admin: !user.is_admin });
        load();
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        await adminAPI.deleteUser(id);
        load();
    };

    const th = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' };
    const td = { padding: '12px 16px', fontSize: 13, color: 'var(--text)', borderTop: '1px solid var(--border)' };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Admin Dashboard</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Manage users, cards, transactions and view reports</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <TabBtn label="Users" active={tab === 'users'} onClick={() => setTab('users')} icon={Users} />
                <TabBtn label="Cards" active={tab === 'cards'} onClick={() => setTab('cards')} icon={CreditCard} />
                <TabBtn label="Transactions" active={tab === 'transactions'} onClick={() => setTab('transactions')} icon={Activity} />
                <TabBtn label="Daily Summary" active={tab === 'summary'} onClick={() => setTab('summary')} icon={BarChart3} />
                {tab === 'transactions' && (
                    <button onClick={exportCSV} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8,
                        border: 'none', background: '#d1fae5', color: '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginLeft: 'auto',
                    }}>
                        <Download size={14} /> Export CSV
                    </button>
                )}
            </div>

            {/* Tables */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading…</div>
                ) : tab === 'users' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Name', 'Email', 'Username', 'Admin', 'Active', 'Joined', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={td}>{u.id}</td>
                                    <td style={td}><span style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</span></td>
                                    <td style={td}>{u.email}</td>
                                    <td style={td}>{u.username}</td>
                                    <td style={td}><span style={{ background: u.is_admin ? '#ede9fe' : 'var(--bg)', color: u.is_admin ? '#6366f1' : 'var(--text-muted)', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>{u.is_admin ? 'ADMIN' : 'USER'}</span></td>
                                    <td style={td}><span style={{ color: u.is_active ? '#059669' : '#dc2626' }}>{u.is_active ? '✓' : '✗'}</span></td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => toggleAdmin(u)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                                                {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                            </button>
                                            <button onClick={() => deleteUser(u.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : tab === 'cards' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Holder', 'Masked Number', 'Type', 'Expiry', 'Default', 'Added'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {cards.map(c => (
                                <tr key={c.id}>
                                    <td style={td}>{c.id}</td>
                                    <td style={{ ...td, fontWeight: 600 }}>{c.card_holder_name}</td>
                                    <td style={{ ...td, fontFamily: 'monospace' }}>{c.masked_number}</td>
                                    <td style={td}>{c.card_type}</td>
                                    <td style={td}>{String(c.expiry_month).padStart(2, '0')}/{c.expiry_year}</td>
                                    <td style={td}>{c.is_default ? <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> : '—'}</td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : tab === 'transactions' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Merchant', 'Amount', 'Status', 'Ref ID', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td style={td}>{t.id}</td>
                                    <td style={{ ...td, fontWeight: 500 }}>{t.merchant_name}</td>
                                    <td style={{ ...td, fontWeight: 700 }}>₹{parseFloat(t.amount).toFixed(2)}</td>
                                    <td style={td}>{statusBadge(t.status)}</td>
                                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{t.reference_id}</td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // Daily Summary
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['Date', 'Status', 'Count', 'Total Amount'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {summary.map((s, i) => (
                                <tr key={i}>
                                    <td style={{ ...td, fontWeight: 600 }}>{s.date}</td>
                                    <td style={td}>{statusBadge(s.status)}</td>
                                    <td style={td}>{s.count}</td>
                                    <td style={{ ...td, fontWeight: 700, color: '#059669' }}>₹{parseFloat(s.total || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                            {summary.length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No summary data yet.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
