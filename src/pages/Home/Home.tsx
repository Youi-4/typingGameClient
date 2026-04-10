import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../services/apiGeneral";
import { useSharedSpace } from "../../context/useSharedSpace";
import "./Home.css";

function Home() {
  const { setNamespace, setRoomId, setRoomSize } = useSharedSpace();
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");
  const [joiningGame, setJoiningGame] = useState(false);
  const [roomSizeInput, setRoomSizeInput] = useState(1);
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const hasCreated = useRef(false);

  const generatePrivateRoom = async () => {
    const roomId = await createRoom("private");
    setGeneratedRoom(roomId);
    return roomId;
  };

  useEffect(() => {
    if (hasCreated.current) return;
    hasCreated.current = true;
    generatePrivateRoom().catch(console.error);
  }, []);

  const createLobby = async () => {
    const roomId = generatedRoom || (await generatePrivateRoom());
    setNamespace("/private_game");
    setRoomSize(roomSizeInput);
    setRoomId(roomId);
    setJoiningGame(true);
    navigate(`/Play/${roomId}`);
  };

  const joinLobby = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = roomInput.trim();
    if (!trimmed) return;
    setJoiningGame(true);
    setRoomSize(null);
    setRoomId(trimmed);
    setNamespace("/private_game");
    navigate(`/Play/${trimmed}`);
  };

  const onlineLobby = async () => {
    setJoiningGame(true);
    const roomId = await createRoom("public");
    setRoomSize(null);
    setNamespace("/public_game");
    setRoomId(roomId);
    navigate(`/Play/${roomId}`);
  };

  return (
    <div className="home-card">
      <div className="home-intro">
        <span className="home-intro-label">Typing Game</span>
        <h1 className="home-intro-title">How do you want to play?</h1>
        <p className="home-intro-sub">Race live against others, warm up solo, or set up a private room with friends.</p>
      </div>

      <div className="mode-grid">
        {/* Online */}
        <div className="mode-card">
          <span className="mode-icon">🌐</span>
          <h2 className="mode-title">Online Race</h2>
          <p className="mode-desc">Get matched with real players and compete in a live typing race.</p>
          <button
            className="mode-btn mode-btn--primary"
            onClick={onlineLobby}
            disabled={joiningGame}
          >
            Join a race →
          </button>
        </div>

        {/* Practice */}
        <div className="mode-card">
          <span className="mode-icon">🎯</span>
          <h2 className="mode-title">Practice</h2>
          <p className="mode-desc">No timer, no pressure. Just you and the keyboard — start instantly.</p>
          <button
            className="mode-btn mode-btn--primary"
            onClick={() => navigate("/Practice")}
            disabled={joiningGame}
          >
            Start practicing →
          </button>
        </div>

        {/* Private */}
        <div className={`mode-card${showPrivate ? " mode-card--active" : ""}`}>
          <span className="mode-icon">🔒</span>
          <h2 className="mode-title">Private Lobby</h2>
          <p className="mode-desc">Create a room and share the code, or paste a friend's code to join.</p>
          <button
            className="mode-btn mode-btn--ghost"
            onClick={() => setShowPrivate((v) => !v)}
          >
            {showPrivate ? "Collapse ↑" : "Set up →"}
          </button>
        </div>
      </div>

      {/* Private expandable section */}
      <div className={`private-section${showPrivate ? " private-section--open" : ""}`}>
        <div className="private-inner">
          <div className="private-panel">
            <h2>Create a lobby</h2>
            <p>Share the room code with your friends.</p>
            <label htmlFor="roomSize">Players:</label>
            <select
              id="roomSize"
              value={roomSizeInput}
              onChange={(e) => setRoomSizeInput(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <button className="mode-btn mode-btn--primary" onClick={createLobby} disabled={joiningGame}>
              Create lobby
            </button>
            <span className="private-hint">Room code: {generatedRoom || "generating…"}</span>
          </div>

          <div className="private-panel">
            <h2>Join a lobby</h2>
            <p>Enter the room code from your friend.</p>
            <form onSubmit={joinLobby} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="private-room-row">
                <input
                  className="lobby-input"
                  placeholder="room code"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                />
              </div>
              <button className="mode-btn mode-btn--primary" type="submit" disabled={joiningGame}>
                Join lobby
              </button>
            </form>
          </div>
        </div>
      </div>

      {joiningGame && (
        <p className="home-waiting">Joining your game, please wait…</p>
      )}
    </div>
  );
}

export default Home;
