import { useState, useEffect } from 'react';
import { transactionsAPI } from '../api';
import { Search, Calendar, Filter, Download } from 'lucide-react';

const statusBadge = (status) => {
    const s = { SUCCESS: { bg: '#d1fae5', color: '#059669' }, FAILED: { bg: '#fee2e2', color: '#dc2626' }, PENDING: { bg: '#fef3c7', color: '#d97706' } };
    return <span style={{ ...s[status], padding: '2px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>{status}</span>;
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '', amount_min: '', amount_max: '' });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const load = () => {
        setLoading(true);
        const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) };
        transactionsAPI.list(params)
            .then(r => {
                const data = r.data;
                if (data.results) { setTransactions(data.results); setTotal(data.count || 0); }
                else { setTransactions(data); setTotal(data.length); }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [filters, page]);

    const handleFilter = (e) => { setFilters({ ...filters, [e.target.name]: e.target.value }); setPage(1); };
    const clearFilters = () => { setFilters({ status: '', date_from: '', date_to: '', amount_min: '', amount_max: '' }); setPage(1); };

    const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none' };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Transaction History</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
                        {total > 0 ? `${total} transaction${total !== 1 ? 's' : ''} found` : 'No transactions'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={16} color="var(--text-muted)" />
                <select style={inp} name="status" value={filters.status} onChange={handleFilter}>
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                </select>
                <input style={inp} type="date" name="date_from" value={filters.date_from} onChange={handleFilter} placeholder="From" />
                <input style={inp} type="date" name="date_to" value={filters.date_to} onChange={handleFilter} placeholder="To" />
                <input style={{ ...inp, width: 110 }} type="number" name="amount_min" value={filters.amount_min} onChange={handleFilter} placeholder="Min ₹" />
                <input style={{ ...inp, width: 110 }} type="number" name="amount_max" value={filters.amount_max} onChange={handleFilter} placeholder="Max ₹" />
                <button onClick={clearFilters} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                    Clear
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                            {['ID', 'MERCHANT', 'CARD', 'AMOUNT', 'STATUS', 'REF ID', 'DATE'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No transactions match your filters.</td></tr>
                        ) : transactions.map((t, i) => (
                            <tr key={t.id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>#{t.id}</td>
                                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t.merchant_name}</td>
                                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.card_detail?.masked_number || '—'}</td>
                                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>₹{parseFloat(t.amount).toFixed(2)}</td>
                                <td style={{ padding: '13px 16px' }}>{statusBadge(t.status)}</td>
                                <td style={{ padding: '13px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.reference_id}</td>
                                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                                    {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {total > 20 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                            ← Prev
                        </button>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: page * 20 >= total ? 'not-allowed' : 'pointer', opacity: page * 20 >= total ? 0.4 : 1 }}>
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
