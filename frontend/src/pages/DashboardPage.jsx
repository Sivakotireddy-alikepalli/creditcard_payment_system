import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI, cardsAPI } from '../api';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react';

const card = (title, value, icon, color) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', flex: 1 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 500 }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
        </div>
    </div>
);

const statusBadge = (status) => {
    const styles = {
        SUCCESS: { background: '#d1fae5', color: '#059669' },
        FAILED: { background: '#fee2e2', color: '#dc2626' },
        PENDING: { background: '#fef3c7', color: '#d97706' },
    };
    return (
        <span style={{ ...styles[status], padding: '2px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
            {status}
        </span>
    );
};

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSpent: 0, totalTxns: 0, monthSpent: 0, success: 0, failed: 0, cards: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([transactionsAPI.list({ ordering: '-created_at' }), cardsAPI.list()])
            .then(([txnRes, cardRes]) => {
                const txns = txnRes.data.results || txnRes.data;
                const now = new Date();
                const thisMonth = txns.filter(t => {
                    const d = new Date(t.created_at);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                setStats({
                    totalSpent: txns.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + parseFloat(t.amount), 0).toFixed(2),
                    totalTxns: txns.length,
                    monthSpent: thisMonth.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + parseFloat(t.amount), 0).toFixed(2),
                    success: txns.filter(t => t.status === 'SUCCESS').length,
                    failed: txns.filter(t => t.status === 'FAILED').length,
                    cards: cardRes.data.length,
                });
                setTransactions(txns.slice(0, 10));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const actionCard = (title, subtitle, onClick) => (
        <div onClick={onClick} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '24px 28px', flex: 1, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', gap: 4,
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</span>
        </div>
    );

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            {/* Greeting */}
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 28 }}>
                HI {user?.first_name || user?.username}!
            </h1>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {card('Total Spent', `₹${stats.totalSpent}`)}
                {card('Total Transactions', stats.totalTxns)}
                {card('This Month Spent', `₹${stats.monthSpent}`)}
                {card('Payment Success', stats.success)}
                {card('Failed Payments', stats.failed)}
                {card('Total Cards', stats.cards)}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {actionCard('Add Card', 'Save Your Cards', () => navigate('/cards/add'))}
                {actionCard('Make Payment', 'Pay Using Saved Card', () => navigate('/payment'))}
                {actionCard('All Transactions', 'View Transactions History', () => navigate('/transactions'))}
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['ID', 'CARD HOLDER', 'CARD NUMBER', 'AMOUNT', 'STATUS', 'DATE'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading…</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No transactions yet. Make your first payment!</td></tr>
                        ) : transactions.map((t, i) => (
                            <tr key={t.id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-muted)' }}>{t.id}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t.card_detail?.card_holder_name || '—'}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.card_detail?.masked_number || '—'}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>₹{parseFloat(t.amount).toFixed(2)}</td>
                                <td style={{ padding: '14px 16px' }}>{statusBadge(t.status)}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                                    {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
