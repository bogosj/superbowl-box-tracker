import { useState } from 'react';

export default function Onboarding({ onSetTeams }) {
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (teamA.trim() && teamB.trim()) {
            onSetTeams({ teamA, teamB });
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1>Game Setup</h1>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    Enter the two teams playing in the Superbowl.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Team 1 (Rows)</label>
                        <input
                            type="text"
                            placeholder="e.g. Chiefs"
                            value={teamA}
                            onChange={(e) => setTeamA(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Team 2 (Cols)</label>
                        <input
                            type="text"
                            placeholder="e.g. Eagles"
                            value={teamB}
                            onChange={(e) => setTeamB(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" style={{ marginTop: '1rem' }}>Start Tracking</button>
                </form>
            </div>
        </div>
    );
}
