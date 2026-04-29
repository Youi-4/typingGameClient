import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/useAuthContext";
import { useUserProfileContext } from "../../context/useUserProfileContext";
import { useNotifications } from "../../context/useNotifications";
import { LetterAvatar } from "../../components/LetterAvatar";
import "./Profile.css";

const COLOR_PALETTE = [
  "#1a73e8", "#e91e63", "#009688", "#ff5722", "#9c27b0",
  "#2196f3", "#ff9800", "#4caf50", "#795548", "#3f51b5",
  "#00bcd4", "#f44336", "#8bc34a", "#ff5252", "#651fff",
];

function Profile() {
  const { user } = useAuthContext();
  const { profile, isSettingProfile, handleProfileSelection } = useUserProfileContext();
  const { acceptsChallenges, setAcceptsChallenges } = useNotifications();

  // null means "user hasn't edited yet — fall back to saved profile value"
  const [bioEdited, setBioEdited] = useState<string | null>(null);
  const [colorEdited, setColorEdited] = useState<string | null>(null);

  const bio = bioEdited ?? profile?.bio ?? "";
  const selectedColor = colorEdited ?? profile?.avatar_color ?? "";

  const username = user?.userName ?? "";

  const handleSave = () => {
    handleProfileSelection({
      username,
      bio: bio.trim() || null,
      avatar_color: selectedColor || null,
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-topbar">
          <Link to={`/user/${username}`} className="profile-view-public">
            View public profile →
          </Link>
        </div>

        <div className="profile-header">
          <LetterAvatar username={username} avatarColor={selectedColor || undefined} size={80} />
          <div className="profile-header-info">
            <h1 className="profile-username">{username}</h1>
            <p className="profile-username-label">Username · cannot be changed</p>
          </div>
        </div>

        <div className="profile-section">
          <label className="profile-field-label" htmlFor="bio-input">Bio</label>
          <textarea
            id="bio-input"
            className="profile-bio-input"
            value={bio}
            onChange={(e) => setBioEdited(e.target.value)}
            placeholder="Tell others a little about yourself…"
            maxLength={200}
          />
          <span className="profile-char-count">{bio.length} / 200</span>
        </div>

        <div className="profile-section">
          <label className="profile-field-label">Avatar Color</label>
          <div className="profile-color-grid">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                className={`profile-color-swatch${selectedColor === color ? " selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setColorEdited(color)}
                title={color}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="profile-section">
          <label className="profile-field-label">Race Challenges</label>
          <div className="profile-toggle-row">
            <span className="profile-toggle-desc">
              Allow other players to challenge you to a race from your public profile.
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={acceptsChallenges}
              className={`profile-toggle${acceptsChallenges ? " profile-toggle--on" : ""}`}
              onClick={() => setAcceptsChallenges(!acceptsChallenges)}
            >
              <span className="profile-toggle-thumb" />
            </button>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-save-btn"
            onClick={handleSave}
            disabled={isSettingProfile}
            type="button"
          >
            {isSettingProfile ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
