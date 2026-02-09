export default function PoolList({ pools, teams, winningScore, score, onDeletePool }) {
    if (pools.length === 0) {
        return (
            <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                No pools added yet. Tap "Add Pool" to get started.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pools.map(pool => {
                const isWinning = pool.pairs.some(p => p.a === winningScore.a && p.b === winningScore.b);
                
                // Calculate "Close" scenarios
                // Helper to check if a specific score difference is needed
                const checkClose = (targetTeam, currentScore, neededPoints) => {
                     return (currentScore + neededPoints) % 10 === targetTeam;
                };

                let closeMessages = [];
                let isClose = false;

                // We only check for close if not winning
                if (!isWinning) {
                    pool.pairs.forEach(p => {
                        const needsA_FG = checkClose(p.a, score.teamA, 3) && p.b === winningScore.b;
                        const needsA_TD = checkClose(p.a, score.teamA, 7) && p.b === winningScore.b;
                        const needsB_FG = checkClose(p.b, score.teamB, 3) && p.a === winningScore.a;
                        const needsB_TD = checkClose(p.b, score.teamB, 7) && p.a === winningScore.a;

                        if (needsA_FG) closeMessages.push(`${teams.teamA} FG`);
                        if (needsA_TD) closeMessages.push(`${teams.teamA} TD`);
                        if (needsB_FG) closeMessages.push(`${teams.teamB} FG`);
                        if (needsB_TD) closeMessages.push(`${teams.teamB} TD`);
                    });
                    
                    if (closeMessages.length > 0) {
                        isClose = true;
                        // Deduplicate messages
                        closeMessages = [...new Set(closeMessages)];
                    }
                }

                return (
                    <div
                        key={pool.id}
                        className="glass-panel"
                        style={{
                            borderColor: isWinning ? 'var(--success-color)' : (isClose ? 'var(--warning-color)' : 'var(--card-border)'),
                            boxShadow: isWinning ? '0 0 15px rgba(74, 222, 128, 0.3)' : (isClose ? '0 0 10px rgba(250, 204, 21, 0.2)' : 'var(--glass-shadow)'),
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }}
                    >
                        {isWinning && (
                            <div style={{
                                position: 'absolute', top: '-10px', right: '1rem',
                                background: 'var(--success-color)', color: '#0f172a',
                                padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                fontWeight: 'bold', fontSize: '0.8rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                            }}>
                                WINNING!
                            </div>
                        )}
                        
                         {isClose && !isWinning && (
                            <div style={{
                                position: 'absolute', top: '-10px', right: '1rem',
                                background: 'var(--warning-color)', color: '#0f172a',
                                padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                fontWeight: 'bold', fontSize: '0.8rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                whiteSpace: 'nowrap',
                                maxWidth: '90%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                Close - {closeMessages.join(', ')} needed
                            </div>
                        )}

                        <button
                            onClick={() => onDeletePool(pool.id)}
                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', padding: '0.5rem', color: 'var(--text-secondary)', opacity: 0.5 }}
                        >
                            ✕
                        </button>

                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Numbers</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {pool.pairs.map((pair, idx) => {
                                    const pairWins = pair.a === winningScore.a && pair.b === winningScore.b;
                                    
                                    // Calculate specific close status for this pair
                                    const isPairClose = !pairWins && (
                                        (checkClose(pair.a, score.teamA, 3) && pair.b === winningScore.b) ||
                                        (checkClose(pair.a, score.teamA, 7) && pair.b === winningScore.b) ||
                                        (checkClose(pair.b, score.teamB, 3) && pair.a === winningScore.a) ||
                                        (checkClose(pair.b, score.teamB, 7) && pair.a === winningScore.a)
                                    );

                                    return (
                                        <span
                                            key={idx}
                                            style={{
                                                background: pairWins ? 'var(--success-color)' : (isPairClose ? 'var(--warning-color)' : 'rgba(255,255,255,0.1)'),
                                                color: (pairWins || isPairClose) ? '#0f172a' : 'inherit',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                fontWeight: (pairWins || isPairClose) ? 'bold' : 'normal',
                                                border: '1px solid',
                                                borderColor: pairWins ? 'var(--success-color)' : (isPairClose ? 'var(--warning-color)' : 'rgba(255,255,255,0.1)')
                                            }}
                                        >
                                            {teams.teamA}:{pair.a}, {teams.teamB}:{pair.b}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Winnings</h3>
                            <div style={{ whiteSpace: 'pre-wrap', opacity: isWinning ? 1 : 0.8 }}>
                                {pool.notes || "No notes"}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
