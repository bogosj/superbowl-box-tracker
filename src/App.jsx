import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import Header from './components/Header';
import PoolList from './components/PoolList';
import AddPoolModal from './components/AddPoolModal';

const DEFAULT_TEAMS = {
  teamA: 'Seahawks',
  teamB: 'Patriots'
};

function App() {
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [pools, setPools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');

    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (parsed.pools) {
            setPools(parsed.pools);
            setTeams(DEFAULT_TEAMS); // Force default teams
            window.history.replaceState({}, document.title, window.location.pathname);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }

    const savedScore = localStorage.getItem('sbt_score');
    const savedPools = localStorage.getItem('sbt_pools');

    setTeams(DEFAULT_TEAMS);
    if (savedScore) setScore(JSON.parse(savedScore));
    if (savedPools) setPools(JSON.parse(savedPools));
    setLoading(false);
  }, []);

  // Save data effects
  // Teams are constant, no need to save

  useEffect(() => {
    localStorage.setItem('sbt_score', JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    localStorage.setItem('sbt_pools', JSON.stringify(pools));
  }, [pools]);



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
    const data = { teams, pools };
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

  const handleReset = () => {
    if (window.confirm('Are you sure you want to RESET everything? This will delete all pools and scores.')) {
      setScore({ teamA: 0, teamB: 0 });
      setPools([]);
      localStorage.removeItem('sbt_score');
      localStorage.removeItem('sbt_pools');
      window.location.reload();
    }
  };

  if (loading) return null;



  const winningScore = {
    a: score.teamA % 10,
    b: score.teamB % 10
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
        <img src="/logo_seahawks.png" alt="Seahawks" style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        <h1 style={{ margin: '0 1rem', fontSize: '1.5rem', alignSelf: 'center' }}>Superbowl LX</h1>
        <img src="/logo_patriots.png" alt="Patriots" style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
      </div>

      <Header teams={teams} score={score} onScoreChange={handleScoreChange} />

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Pools</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleReset}
            className="secondary-btn"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', color: '#ef4444', borderColor: '#ef4444' }}
          >
            Reset
          </button>
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
          gap: '0.5rem'
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
