import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import PoolList from './components/PoolList';
import AddPoolModal from './components/AddPoolModal';

function App() {
  const [teams, setTeams] = useState(null);
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
          if (parsed.teams && parsed.pools) {
            setTeams(parsed.teams);
            setPools(parsed.pools);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }

    const savedTeams = localStorage.getItem('sbt_teams');
    const savedScore = localStorage.getItem('sbt_score');
    const savedPools = localStorage.getItem('sbt_pools');

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedScore) setScore(JSON.parse(savedScore));
    if (savedPools) setPools(JSON.parse(savedPools));
    setLoading(false);
  }, []);

  // Save data effects
  useEffect(() => {
    if (teams) localStorage.setItem('sbt_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('sbt_score', JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    localStorage.setItem('sbt_pools', JSON.stringify(pools));
  }, [pools]);

  const handleSetTeams = (newTeams) => {
    setTeams(newTeams);
  };

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

  if (loading) return null;

  if (!teams) {
    return <Onboarding onSetTeams={handleSetTeams} />;
  }

  const winningScore = {
    a: score.teamA % 10,
    b: score.teamB % 10
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      <Header teams={teams} score={score} onScoreChange={handleScoreChange} />

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Pools</h2>
        <button
          onClick={handleShare}
          className="secondary-btn"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          Share
        </button>
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
