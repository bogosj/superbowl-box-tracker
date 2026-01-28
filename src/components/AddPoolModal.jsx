import { useState } from 'react';

export default function AddPoolModal({ teams, onClose, onSave }) {
    const [pairs, setPairs] = useState([{ a: '', b: '' }]);
    const [notes, setNotes] = useState('');

    const addPair = () => {
        setPairs([...pairs, { a: '', b: '' }]);
    };

    const removePair = (index) => {
        setPairs(pairs.filter((_, i) => i !== index));
    };

    const updatePair = (index, field, value) => {
        const newPairs = [...pairs];
        newPairs[index][field] = value;
        setPairs(newPairs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // content validation
        const validPairs = pairs.filter(p => p.a !== '' && p.b !== '').map(p => ({
            a: parseInt(p.a),
            b: parseInt(p.b)
        }));

        if (validPairs.length === 0) return;

        onSave({
            id: Date.now().toString(),
            pairs: validPairs,
            notes
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1rem' }}>Add New Pool</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Number Pairs</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                            <div>{teams.teamA}</div>
                            <div>{teams.teamB}</div>
                            <div></div>
                        </div>

                        {pairs.map((pair, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="number"
                                    min="0" max="9"
                                    placeholder="0-9"
                                    value={pair.a}
                                    onChange={(e) => updatePair(index, 'a', e.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    min="0" max="9"
                                    placeholder="0-9"
                                    value={pair.b}
                                    onChange={(e) => updatePair(index, 'b', e.target.value)}
                                    required
                                />
                                {pairs.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePair(index)}
                                        className="secondary-btn"
                                        style={{ padding: '0.5rem', color: '#ef4444' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addPair}
                            className="secondary-btn"
                            style={{ width: '100%', marginTop: '0.5rem', border: '1px dashed var(--card-border)' }}
                        >
                            + Add Another Pair
                        </button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Winnings / Notes</label>
                        <textarea
                            rows="4"
                            placeholder="e.g. Q1: $50, Halftime: $100..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ flex: 1 }}>
                            Save Pool
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
