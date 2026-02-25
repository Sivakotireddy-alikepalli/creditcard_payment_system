import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardsAPI } from '../api';
import { CreditCard, ArrowLeft } from 'lucide-react';

const CARD_TYPES = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER'];

export default function AddCardPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ card_holder_name: '', card_number: '', card_type: 'VISA', expiry_month: '', expiry_year: '', is_default: false });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    // Format card number display with spaces
    const handleCardNumber = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        setForm({ ...form, card_number: val });
    };

    const displayCard = form.card_number.replace(/(.{4})/g, '$1 ').trim();

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');
        setLoading(true);
        try {
            await cardsAPI.add({ ...form, expiry_month: parseInt(form.expiry_month), expiry_year: parseInt(form.expiry_year) });
            setSuccess('Card added successfully!');
            setTimeout(() => navigate('/cards'), 1500);
        } catch (err) {
            setErrors(err.response?.data || {});
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
            <button onClick={() => navigate('/cards')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={16} /> Back to Cards
            </button>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={22} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Add New Card</h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Card number is masked before saving</p>
                    </div>
                </div>

                {/* Card Preview */}
                <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4338ca)', borderRadius: 14, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span style={{ fontSize: 13, opacity: 0.8 }}>{form.card_type}</span>
                        <CreditCard size={24} opacity={0.8} />
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 3, margin: '0 0 16px', opacity: 0.9 }}>
                        {displayCard || '**** **** **** ****'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ opacity: 0.8 }}>{form.card_holder_name || 'Card Holder Name'}</span>
                        <span style={{ opacity: 0.8 }}>
                            {form.expiry_month ? String(form.expiry_month).padStart(2, '0') : 'MM'}/{form.expiry_year || 'YYYY'}
                        </span>
                    </div>
                </div>

                {success && (
                    <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#059669', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                        ✓ {success}
                    </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={lbl}>Card Holder Name</label>
                        <input style={inp('card_holder_name')} name="card_holder_name" value={form.card_holder_name} onChange={handle} placeholder="John Doe" required />
                    </div>
                    <div>
                        <label style={lbl}>Card Number <span style={{ color: '#6366f1', fontSize: 11 }}>(not stored — only last 4 digits saved)</span></label>
                        <input style={inp('card_number')} value={displayCard} onChange={handleCardNumber} placeholder="1234 5678 9012 3456" maxLength={19} required />
                        {errors.card_number && <p style={{ color: '#ef4444', fontSize: 12, margin: '2px 0 0' }}>{errors.card_number}</p>}
                    </div>
                    <div>
                        <label style={lbl}>Card Type</label>
                        <select style={{ ...inp('card_type'), cursor: 'pointer' }} name="card_type" value={form.card_type} onChange={handle}>
                            {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={lbl}>Expiry Month</label>
                            <select style={{ ...inp('expiry_month'), cursor: 'pointer' }} name="expiry_month" value={form.expiry_month} onChange={handle} required>
                                <option value="">Month</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Expiry Year</label>
                            <select style={{ ...inp('expiry_year'), cursor: 'pointer' }} name="expiry_year" value={form.expiry_year} onChange={handle} required>
                                <option value="">Year</option>
                                {Array.from({ length: 15 }, (_, i) => 2024 + i).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)' }}>
                        <input type="checkbox" name="is_default" checked={form.is_default} onChange={handle} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                        Set as default card
                    </label>
                    <button type="submit" disabled={loading} style={{
                        marginTop: 4, padding: '12px', borderRadius: 8, border: 'none',
                        background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Adding Card…' : 'Add Card Securely'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                    🔒 CVV is never requested or stored. Card number is masked immediately.
                </p>
            </div>
        </div>
    );
}
