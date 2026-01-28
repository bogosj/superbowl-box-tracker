import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import Header from './components/Header';
import PoolList from './components/PoolList';
import AddPoolModal from './components/AddPoolModal';

const GAME_CONFIG = {
  superbowl: {
    id: 'superbowl',
    label: 'Super Bowl LX',
    teamA: 'Seahawks',
    teamB: 'Patriots',
    logoA: '/logo_seahawks.png',
    logoB: '/logo_patriots.png'
  },
  probowl: {
    id: 'probowl',
    label: 'Pro Bowl Phone It In',
    teamA: 'AFC',
    teamB: 'NFC',
    logoA: '/logo_afc.png',
    logoB: '/logo_nfc.png'
  }
};

const DEFAULT_SCORES = {
  superbowl: { teamA: 0, teamB: 0 },
  probowl: { teamA: 0, teamB: 0 }
};

function App() {
  const [activeGame, setActiveGame] = useState('superbowl');
  const [teams, setTeams] = useState(GAME_CONFIG.superbowl);
  const [score, setScore] = useState(DEFAULT_SCORES);
  const [pools, setPools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Update teams when active game changes
  useEffect(() => {
    setTeams(GAME_CONFIG[activeGame]);
  }, [activeGame]);

  // Load data from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');

    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);

          let loadedPools = [];

          if (Array.isArray(parsed.pools)) {
            // Check if legacy (no gameId) - default to superbowl
            loadedPools = parsed.pools.map(p => ({
              ...p,
              gameId: p.gameId || 'superbowl'
            }));
          }

          setPools(loadedPools);
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
        // Check if legacy score format (flat object)
        if (typeof parsedScore.teamA === 'number') {
          setScore({
            ...DEFAULT_SCORES,
            superbowl: parsedScore
          });
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
        // Migrate legacy pools
        const migratedPools = parsedPools.map(p => ({
          ...p,
          gameId: p.gameId || 'superbowl'
        }));
        setPools(migratedPools);
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

        let newScores = { ...score };
        let updated = false;

        // Process Super Bowl (Seahawks vs Patriots)
        // Find the specific game
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
            newScores.superbowl = {
              teamA: parseInt(seahawks.score),
              teamB: parseInt(patriots.score)
            };
            updated = true;
          }
        }

        // Process Pro Bowl (NFC vs AFC)
        // Note: ESPN API usually lists Pro Bowl as NFC vs AFC or similar
        const pbEvent = data.events?.find(e => {
          const name = e.name?.toLowerCase() || "";
          return name.includes('pro bowl') || (name.includes('afc') && name.includes('nfc'));
        });

        if (pbEvent) {
          const competition = pbEvent.competitions[0];
          const afc = competition.competitors.find(c => c.team.abbreviation === 'AFC' || c.team.displayName === 'AFC');
          const nfc = competition.competitors.find(c => c.team.abbreviation === 'NFC' || c.team.displayName === 'NFC');

          if (afc && nfc) {
            newScores.probowl = {
              teamA: parseInt(afc.score), // Team A is AFC in config
              teamB: parseInt(nfc.score)  // Team B is NFC in config
            };
            updated = true;
          }
        }

        if (updated) {
          setScore(newScores);
        }

      } catch (err) {
        console.error("Error fetching live score:", err);
      }
    };

    fetchScore(); // Initial fetch
    const interval = setInterval(fetchScore, 60000); // Poll every 60s

    return () => clearInterval(interval);
  }, [isLive, score]);



  const handleScoreChange = (team, value) => {
    setScore(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        [team]: value
      }
    }));
  };

  const handleAddPool = (newPool) => {
    const poolWithGame = { ...newPool, gameId: activeGame };
    setPools(prev => [poolWithGame, ...prev]);
  };

  const handleDeletePool = (id) => {
    if (window.confirm('Delete this pool?')) {
      setPools(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleShare = async () => {
    // Share ALL pools, not just active ones
    const data = { pools };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard! (Includes pools for both games)');
    } catch (err) {
      console.error('Failed to copy: ', err);
      prompt('Copy this link:', url);
    }
  };

  if (loading) return null;

  const currentScore = score[activeGame];
  const winningScore = {
    a: currentScore.teamA % 10,
    b: currentScore.teamB % 10
  };

  // Filter pools for active game
  const activePools = pools.filter(p => p.gameId === activeGame);

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>

      {/* Game Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '2rem', width: 'fit-content', marginInline: 'auto', marginTop: '1rem' }}>
        <button
          onClick={() => setActiveGame('superbowl')}
          style={{
            background: activeGame === 'superbowl' ? 'rgba(255,255,255,0.2)' : 'transparent',
            padding: '0.5rem 1.5rem',
            borderRadius: '1.5rem',
            border: 'none',
            color: 'white',
            fontWeight: activeGame === 'superbowl' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Super Bowl
        </button>
        <button
          onClick={() => setActiveGame('probowl')}
          style={{
            background: activeGame === 'probowl' ? 'rgba(255,255,255,0.2)' : 'transparent',
            padding: '0.5rem 1.5rem',
            borderRadius: '1.5rem',
            border: 'none',
            color: 'white',
            fontWeight: activeGame === 'probowl' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Pro Bowl
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
        <img src={teams.logoA} alt={teams.teamA} style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        <h1 style={{ margin: '0 1rem', fontSize: '1.5rem', alignSelf: 'center' }}>{teams.label}</h1>
        <img src={teams.logoB} alt={teams.teamB} style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
      </div>

      <Header
        teams={teams}
        score={currentScore}
        onScoreChange={handleScoreChange}
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
      />

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Pools ({activePools.length})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleShare}
            className="secondary-btn"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            Share All
          </button>
        </div>
      </div>

      <PoolList
        pools={activePools}
        teams={teams}
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
          background: 'var(--primary-gradient)', // Ensure this is set or default
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
          teams={teams}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddPool}
        />
      )}
    </div>
  );
}

export default App;
