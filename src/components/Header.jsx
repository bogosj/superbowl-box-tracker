export default function Header({ teams, score, onScoreChange }) {
    const winningA = score.teamA % 10;
    const winningB = score.teamB % 10;

    return (
        <div className="glass-panel" style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 10,
            marginBottom: '1.5rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.9)', // More opaque for sticky
            backdropFilter: 'blur(16px)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, opacity: 0.8 }}>Current Score</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                    Winning: {winningA} - {winningB}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Team A */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--accent-color)' }}>{teams.teamA}</div>
                    <input
                        type="number"
                        value={score.teamA === 0 ? '0' : score.teamA.toString()}
                        onChange={(e) => onScoreChange('teamA', parseInt(e.target.value) || 0)}
                        style={{
                            fontSize: '2rem',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            height: '60px',
                            width: '100%'
                        }}
                    />
                </div>

                {/* Team B */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--highlight-color)' }}>{teams.teamB}</div>
                    <input
                        type="number"
                        value={score.teamB === 0 ? '0' : score.teamB.toString()}
                        onChange={(e) => onScoreChange('teamB', parseInt(e.target.value) || 0)}
                        style={{
                            fontSize: '2rem',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            height: '60px',
                            width: '100%'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
