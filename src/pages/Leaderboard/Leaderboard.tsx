import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../../services/apiGeneral';
import './Leaderboard.css';

const RANK_CLASS = ['gold', 'silver', 'bronze'];

function Leaderboard() {
  const { data: players, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  if (isLoading) {
    return <div className="lb-page"><div className="lb-loading">Loading leaderboard...</div></div>;
  }

  if (isError || !players) {
    return <div className="lb-page"><div className="lb-error">Failed to load leaderboard.</div></div>;
  }

  if (players.length === 0) {
    return <div className="lb-page"><div className="lb-empty">No races completed yet. Be the first!</div></div>;
  }

  return (
    <div className="lb-page">
      <div className="lb-container">
        <h1 className="lb-heading">Leaderboard</h1>
        <p className="lb-subheading">Top 10 players ranked by best WPM.</p>

        <div className="lb-card">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th className="right">Best WPM</th>
                <th className="right">Avg WPM</th>
                <th className="right">Win Rate</th>
                <th className="right">Races</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                const winRate = p.race_completed > 0
                  ? Math.round((p.race_won / p.race_completed) * 100)
                  : 0;
                const rankClass = RANK_CLASS[i] ?? 'other';
                return (
                  <tr key={p.username}>
                    <td className="lb-rank">
                      <span className={`lb-rank ${rankClass}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                    </td>
                    <td className="lb-username">{p.username}</td>
                    <td className="right lb-best">{p.race_best}</td>
                    <td className="right lb-avg">{Math.round(p.race_avg)}</td>
                    <td className="right lb-winrate">{winRate}%</td>
                    <td className="right">{p.race_completed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
