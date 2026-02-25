import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardsAPI } from '../api';
import { CreditCard, PlusCircle, Trash2, Star } from 'lucide-react';

const CARD_TYPES = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER'];

const CardTypeIcon = ({ type }) => {
    const colors = { VISA: '#1a1f71', MASTERCARD: '#eb001b', AMEX: '#007bc1', DISCOVER: '#ff6600', OTHER: '#6366f1' };
    return <span style={{ fontWeight: 800, fontSize: 13, color: colors[type] || '#6366f1', letterSpacing: 1 }}>{type}</span>;
};

export default function CardsPage() {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    const load = () => cardsAPI.list().then(r => setCards(r.data)).finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const deleteCard = async (id) => {
        if (!window.confirm('Delete this card?')) return;
        setDeleting(id);
        await cardsAPI.delete(id).catch(() => { });
        await load();
        setDeleting(null);
    };

    const setDefault = async (id) => {
        await cardsAPI.setDefault(id).catch(() => { });
        await load();
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Cards</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Manage your saved payment cards</p>
                </div>
                <button onClick={() => navigate('/cards/add')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                    borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>
                    <PlusCircle size={16} /> Add Card
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading cards…</div>
            ) : cards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <CreditCard size={48} color="#6366f1" style={{ marginBottom: 12 }} />
                    <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>No cards yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add your first card to start making payments</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {cards.map(card => (
                        <div key={card.id} style={{
                            background: 'var(--surface)', border: `2px solid ${card.is_default ? '#6366f1' : 'var(--border)'}`,
                            borderRadius: 14, padding: 20, position: 'relative', transition: 'all 0.2s',
                        }}>
                            {card.is_default && (
                                <span style={{ position: 'absolute', top: 12, right: 12, background: '#ede9fe', color: '#6366f1', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>DEFAULT</span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={22} color="white" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{card.card_holder_name}</p>
                                    <CardTypeIcon type={card.card_type} />
                                </div>
                            </div>
                            <p style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8, letterSpacing: 2 }}>{card.masked_number}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Expires {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!card.is_default && (
                                    <button onClick={() => setDefault(card.id)} style={{
                                        flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
                                        background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                    }}>
                                        <Star size={13} /> Set Default
                                    </button>
                                )}
                                <button onClick={() => deleteCard(card.id)} disabled={deleting === card.id} style={{
                                    flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #fca5a5',
                                    background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                }}>
                                    <Trash2 size={13} /> {deleting === card.id ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
