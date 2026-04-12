import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRaceHistory, getStats } from '../../services/apiGeneral';
import { useAuthContext } from '../../context/useAuthContext';
import WpmHistoryChart from '../../components/WpmHistoryChart';
import './Stats.css';

function Stats() {
  const { user } = useAuthContext();
  const [modeFilter, setModeFilter] = useState<'all' | 'multiplayer' | 'practice' | 'challenge'>('all');

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: true,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['raceHistory'],
    queryFn: getRaceHistory,
    refetchOnMount: 'always',
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

        {/* WPM progression chart */}
        <div className="history-section">
          <div className="history-header">
            <p className="history-title">WPM Progression</p>
            <div className="history-filters">
              {(['all', 'multiplayer', 'practice', 'challenge'] as const).map(f => (
                <button
                  key={f}
                  className={`history-filter-btn${modeFilter === f ? ' active' : ''}`}
                  onClick={() => setModeFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const filtered = modeFilter === 'all'
              ? history
              : history.filter(h => h.mode === modeFilter);

            if (filtered.length === 0) {
              return (
                <p className="history-empty">
                  No races yet{modeFilter !== 'all' ? ` in ${modeFilter} mode` : ''}. Complete a race to see your progression.
                </p>
              );
            }

            return (
              <>
                <WpmHistoryChart data={filtered} />
                <div className="history-legend">
                  <span className="history-legend-dot multiplayer" />
                  <span className="history-legend-label">Multiplayer</span>
                  <span className="history-legend-dot practice" />
                  <span className="history-legend-label">Practice</span>
                  <span className="history-legend-dot challenge" />
                  <span className="history-legend-label">Challenge</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Stats;
