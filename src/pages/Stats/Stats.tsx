import { useQuery } from '@tanstack/react-query';
import { getStats } from '../../services/apiGeneral';
import { useAuthContext } from '../../context/useAuthContext';
import './Stats.css';

function Stats() {
  const { user } = useAuthContext();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">Loading your stats...</div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="stats-page">
        <div className="stats-error">Failed to load stats. Make sure you are logged in.</div>
      </div>
    );
  }

  const completed = stats.race_completed ?? 0;
  const won = stats.race_won ?? 0;
  const winRate = completed > 0 ? Math.round((won / completed) * 100) : 0;
  const best = stats.race_best ?? 0;
  const avg = stats.race_avg ?? 0;
  const last = stats.race_last ?? 0;
  const barMax = Math.max(best, 1);

  return (
    <div className="stats-page">
      <div className="stats-container">
        <h1 className="stats-heading">
          {user?.userName ? `${user.userName}'s Stats` : 'Your Stats'}
        </h1>
        <p className="stats-subheading">Your typing performance across all races.</p>

        {/* Summary cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <p className="stat-card-label">Best WPM</p>
            <p className="stat-card-value">
              {best}<span className="stat-card-unit">wpm</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Avg WPM</p>
            <p className="stat-card-value purple">
              {avg}<span className="stat-card-unit">wpm</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Last Race</p>
            <p className="stat-card-value orange">
              {last}<span className="stat-card-unit">wpm</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Races Won</p>
            <p className="stat-card-value green">
              {won}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Races Played</p>
            <p className="stat-card-value">
              {completed}
            </p>
          </div>
        </div>

        {/* Win rate */}
        <div className="winrate-section">
          <div className="winrate-header">
            <p className="winrate-title">Win Rate</p>
            <span className="winrate-pct">{winRate}%</span>
          </div>
          <div className="winrate-bar-track">
            <div className="winrate-bar-fill" style={{ width: `${winRate}%` }} />
          </div>
          <div className="winrate-counts">
            <span>{won} wins</span>
            <span>{completed - won} losses</span>
          </div>
        </div>

        {/* WPM breakdown */}
        <div className="wpm-section">
          <p className="wpm-section-title">WPM Breakdown</p>

          <div className="wpm-row">
            <span className="wpm-row-label">Best</span>
            <div className="wpm-row-bar-track">
              <div
                className="wpm-row-bar-fill best"
                style={{ width: `${(best / barMax) * 100}%` }}
              />
            </div>
            <span className="wpm-row-value">{best}</span>
          </div>

          <div className="wpm-row">
            <span className="wpm-row-label">Average</span>
            <div className="wpm-row-bar-track">
              <div
                className="wpm-row-bar-fill avg"
                style={{ width: `${(avg / barMax) * 100}%` }}
              />
            </div>
            <span className="wpm-row-value">{avg}</span>
          </div>

          <div className="wpm-row">
            <span className="wpm-row-label">Last</span>
            <div className="wpm-row-bar-track">
              <div
                className="wpm-row-bar-fill last"
                style={{ width: `${(last / barMax) * 100}%` }}
              />
            </div>
            <span className="wpm-row-value">{last}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
