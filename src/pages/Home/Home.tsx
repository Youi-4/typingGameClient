
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState<string>("");

  const generatedRoom = useMemo(() => {
    return Math.random().toString(36).slice(2, 8).toLowerCase();
  }, []);

  const createLobby = () => {
    navigate(`/Play/${generatedRoom}`);
  };

  const joinLobby = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = roomInput.trim();
    if (!trimmed) return;
    navigate(`/Play/${trimmed}`);
  };

  return (
    <div className="lobby-card">
      <div className="lobby-header">
        <h1 className="lobby-title">Shared Lobby</h1>
        <p className="lobby-subtitle">
          Create a room or join one to play together.
        </p>
      </div>

      <div className="lobby-grid">
        <div className="lobby-panel">
          <h2>Create a lobby</h2>
          <p>Start a new game room and share the link.</p>
          <button className="lobby-button" onClick={createLobby}>
            Create lobby
          </button>
          <div className="lobby-hint">Room code: {generatedRoom}</div>
        </div>

        <div className="lobby-panel">
          <h2>Join a lobby</h2>
          <p>Enter a room code or paste a link code.</p>
          <form className="lobby-form" onSubmit={joinLobby}>
            <input
              className="lobby-input"
              placeholder="room code"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value)}
            />
            <button className="lobby-button" type="submit">
              Join lobby
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
