import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardsAPI, paymentsAPI, transactionsAPI } from '../api';
import { CreditCard, Zap, CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';

export default function MakePaymentPage() {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({ card_id: '', amount: '', merchant_name: '', description: '', currency: 'INR' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        cardsAPI.list().then(r => {
            setCards(r.data);
            const def = r.data.find(c => c.is_default) || r.data[0];
            if (def) setForm(f => ({ ...f, card_id: def.id }));
        });
    }, []);

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.card_id) { setErrors({ card_id: 'Please select a card.' }); return; }
        if (!form.amount || parseFloat(form.amount) <= 0) { setErrors({ amount: 'Amount must be greater than 0.' }); return; }
        setErrors({});
        setLoading(true);
        setResult(null);
        try {
            // Call FastAPI for payment processing
            const { data: payRes } = await paymentsAPI.process({
                card_id: parseInt(form.card_id),
                amount: parseFloat(form.amount),
                currency: form.currency,
                merchant_name: form.merchant_name || 'Online Purchase',
                description: form.description,
            });

            // Create the transaction in Django
            await transactionsAPI.create({
                card_id: parseInt(form.card_id),
                amount: form.amount,
                currency: form.currency,
                merchant_name: form.merchant_name || 'Online Purchase',
                description: form.description,
            }).then(async (txnRes) => {
                // Update status from FastAPI result
                await transactionsAPI.updateStatus(txnRes.data.reference_id, {
                    status: payRes.status,
                    failure_reason: payRes.failure_reason || '',
                });
            });

            setResult(payRes);
        } catch (err) {
            setResult({ status: 'FAILED', failure_reason: err.response?.data?.detail || 'Payment service error.' });
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

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={22} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Make Payment</h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Payments are simulated (no real charges)</p>
                    </div>
                </div>

                {/* Result Display */}
                {result && (
                    <div style={{
                        background: result.status === 'SUCCESS' ? '#d1fae5' : '#fef2f2',
                        border: `1px solid ${result.status === 'SUCCESS' ? '#6ee7b7' : '#fca5a5'}`,
                        color: result.status === 'SUCCESS' ? '#059669' : '#dc2626',
                        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}>
                        {result.status === 'SUCCESS' ? <CheckCircle size={22} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={22} style={{ flexShrink: 0, marginTop: 2 }} />}
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Payment {result.status}</p>
                            {result.status === 'SUCCESS' ? (
                                <p style={{ margin: '4px 0 0', fontSize: 13 }}>Reference: <code>{result.reference_id}</code></p>
                            ) : (
                                <p style={{ margin: '4px 0 0', fontSize: 13 }}>{result.failure_reason}</p>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={lbl}>Select Card</label>
                        <select style={{ ...inp('card_id'), cursor: 'pointer' }} name="card_id" value={form.card_id} onChange={handle} required>
                            <option value="">-- Select a card --</option>
                            {cards.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.card_holder_name} • {c.masked_number} {c.is_default ? '(Default)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.card_id && <p style={{ color: '#ef4444', fontSize: 12, margin: '2px 0 0' }}>{errors.card_id}</p>}
                        {cards.length === 0 && <p style={{ color: '#f59e0b', fontSize: 12, margin: '4px 0 0' }}>No cards found. <button type="button" onClick={() => navigate('/cards/add')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600 }}>Add one first</button></p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                        <div>
                            <label style={lbl}>Amount (₹)</label>
                            <input style={inp('amount')} name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handle} placeholder="0.00" required />
                            {errors.amount && <p style={{ color: '#ef4444', fontSize: 12, margin: '2px 0 0' }}>{errors.amount}</p>}
                        </div>
                        <div>
                            <label style={lbl}>Currency</label>
                            <select style={{ ...inp('currency'), cursor: 'pointer' }} name="currency" value={form.currency} onChange={handle}>
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Merchant Name</label>
                        <input style={inp('merchant_name')} name="merchant_name" value={form.merchant_name} onChange={handle} placeholder="Amazon, Flipkart…" />
                    </div>
                    <div>
                        <label style={lbl}>Description (optional)</label>
                        <input style={inp('description')} name="description" value={form.description} onChange={handle} placeholder="What's this payment for?" />
                    </div>
                    <button type="submit" disabled={loading || cards.length === 0} style={{
                        marginTop: 4, padding: '14px', borderRadius: 8, border: 'none',
                        background: loading || cards.length === 0 ? '#a5b4fc' : 'linear-gradient(135deg,#10b981,#059669)',
                        color: 'white', fontWeight: 700, fontSize: 15, cursor: loading || cards.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : `Pay ₹${form.amount || '0.00'}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
