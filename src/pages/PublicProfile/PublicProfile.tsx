import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "../../services/apiGeneral";
import { LetterAvatar } from "../../components/LetterAvatar";
import "./PublicProfile.css";

function PublicProfile() {
  const { username } = useParams<{ username: string }>();

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => getPublicProfile(username!),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="pubprofile-page">
        <div className="pubprofile-loading">Loading profile…</div>
      </div>
    );
  }

  if (isError || !profileData) {
    return (
      <div className="pubprofile-page">
        <div className="pubprofile-error">Profile not found.</div>
      </div>
    );
  }

  const { stats } = profileData;
  const winRate =
    stats.race_completed > 0
      ? Math.round((stats.race_won / stats.race_completed) * 100)
      : 0;

  return (
    <div className="pubprofile-page">
      <div className="pubprofile-container">
        <div className="pubprofile-card">
          <div className="pubprofile-header">
            <LetterAvatar
              username={profileData.username}
              avatarColor={profileData.avatar_color}
              size={72}
            />
            <div className="pubprofile-header-info">
              <h1 className="pubprofile-username">{profileData.username}</h1>
              {profileData.bio ? (
                <p className="pubprofile-bio">{profileData.bio}</p>
              ) : (
                <p className="pubprofile-bio pubprofile-bio--empty">No bio yet.</p>
              )}
            </div>
          </div>

          <div className="pubprofile-divider" />

          <div className="pubprofile-stats">
            <div className="pubprofile-stat">
              <span className="pubprofile-stat-value">{stats.race_best}</span>
              <span className="pubprofile-stat-label">Best WPM</span>
            </div>
            <div className="pubprofile-stat">
              <span className="pubprofile-stat-value">{Math.round(stats.race_avg)}</span>
              <span className="pubprofile-stat-label">Avg WPM</span>
            </div>
            <div className="pubprofile-stat">
              <span className="pubprofile-stat-value">{winRate}%</span>
              <span className="pubprofile-stat-label">Win Rate</span>
            </div>
            <div className="pubprofile-stat">
              <span className="pubprofile-stat-value">{stats.race_completed}</span>
              <span className="pubprofile-stat-label">Races</span>
            </div>
          </div>
        </div>

        <div className="pubprofile-actions">
          <Link to="/Home" className="pubprofile-race-btn">
            Race against {profileData.username} →
          </Link>
          <Link to="/Leaderboard" className="pubprofile-lb-link">
            View leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
