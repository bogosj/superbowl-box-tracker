import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import Header from './components/Header';
import PoolList from './components/PoolList';
import AddPoolModal from './components/AddPoolModal';

const TEAMS = {
  id: 'superbowl',
  label: 'Super Bowl LX',
  teamA: 'Seahawks',
  teamB: 'Patriots',
  logoA: '/logo_seahawks.png',
  logoB: '/logo_patriots.png'
};

const DEFAULT_SCORE = { teamA: 0, teamB: 0 };

function App() {
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [pools, setPools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Load data from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');

    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          
          if (Array.isArray(parsed.pools)) {
            setPools(parsed.pools);
          } else {
             setPools([]);
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }

    const savedScore = localStorage.getItem('sbt_score');
    const savedPools = localStorage.getItem('sbt_pools');

    // Migration logic for local storage
    if (savedScore) {
      try {
        const parsedScore = JSON.parse(savedScore);
        // Handle nested format from Pro Bowl era
        if (parsedScore.superbowl) {
          setScore(parsedScore.superbowl);
        } else {
          setScore(parsedScore);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (savedPools) {
      try {
        const parsedPools = JSON.parse(savedPools);
        setPools(parsedPools);
      } catch (e) {
        console.error(e);
      }
    }

    setLoading(false);
  }, []);

  // Save data effects
  useEffect(() => {
    localStorage.setItem('sbt_score', JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    localStorage.setItem('sbt_pools', JSON.stringify(pools));
  }, [pools]);

  // Live Score Polling
  useEffect(() => {
    if (!isLive) return;

    const fetchScore = async () => {
      try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        const data = await res.json();

        setScore(prevScore => {
          // Process Super Bowl
          const sbEvent = data.events?.find(e => {
            const names = e.shortName?.toLowerCase() || "";
            return names.includes('seahawks') || names.includes('patriots') ||
              (e.competitions?.[0]?.competitors?.some(c => c.team?.displayName?.includes('Seahawks'))) ||
              e.name.includes('Super Bowl');
          });

          if (sbEvent) {
            const competition = sbEvent.competitions[0];
            const seahawks = competition.competitors.find(c => c.team.displayName.includes('Seahawks'));
            const patriots = competition.competitors.find(c => c.team.displayName.includes('Patriots'));

            if (seahawks && patriots) {
              const newTeamA = parseInt(seahawks.score);
              const newTeamB = parseInt(patriots.score);

              if (prevScore.teamA !== newTeamA || prevScore.teamB !== newTeamB) {
                return {
                  teamA: newTeamA,
                  teamB: newTeamB
                };
              }
            }
          }
          return prevScore;
        });

      } catch (err) {
        console.error("Error fetching live score:", err);
      }
    };

    fetchScore(); // Initial fetch
    const interval = setInterval(fetchScore, 60000); // Poll every 60s

    return () => clearInterval(interval);
  }, [isLive]);

  const handleScoreChange = (team, value) => {
    setScore(prev => ({
      ...prev,
      [team]: value
    }));
  };

  const handleAddPool = (newPool) => {
    setPools(prev => [newPool, ...prev]);
  };

  const handleDeletePool = (id) => {
    if (window.confirm('Delete this pool?')) {
      setPools(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleShare = async () => {
    const data = { pools };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      prompt('Copy this link:', url);
    }
  };

  if (loading) return null;

  const winningScore = {
    a: score.teamA % 10,
    b: score.teamB % 10
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
        <img src={TEAMS.logoA} alt={TEAMS.teamA} style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        <h1 style={{ margin: '0 1rem', fontSize: '1.5rem', alignSelf: 'center' }}>{TEAMS.label}</h1>
        <img src={TEAMS.logoB} alt={TEAMS.teamB} style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
      </div>

      <Header
        teams={TEAMS}
        score={score}
        onScoreChange={handleScoreChange}
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
      />

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Pools ({pools.length})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleShare}
            className="secondary-btn"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            Share
          </button>
        </div>
      </div>

      <PoolList
        pools={pools}
        teams={TEAMS}
        winningScore={winningScore}
        onDeletePool={handleDeletePool}
      />

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          borderRadius: '2rem',
          padding: '1rem 2rem',
          boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
          zIndex: 50,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--primary-gradient)',
          border: 'none',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '1.5rem', lineHeight: 0 }}>+</span> Add Pool
      </button>

      {isModalOpen && (
        <AddPoolModal
          teams={TEAMS}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddPool}
        />
      )}
    </div>
  );
}

export default App;
