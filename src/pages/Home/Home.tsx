
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../services/apiGeneral";
import { useSharedSpace } from "../../context/useSharedSpace"

function Home() {
  
  const { setNamespace, setRoomId, setRoomSize } = useSharedSpace();
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState<string>("");
  const [joiningGame, setJoiningGame] = useState(false);
  const [roomSizeInput, setRoomSizeInput] = useState<number>(1);
  const [generatedRoom, setGeneratedRoom] = useState<string>("");
  const hasCreated = useRef(false);
  useEffect(() => {
    if (hasCreated.current) return;
    hasCreated.current = true;
    const generateRoom = async () => {
      try {
        const roomId = await createRoom("private");
        console.log("API response roomId:", roomId);
        setGeneratedRoom(roomId);
      } catch (err) {
        console.error("createRoom failed:", err);
      }
    };
    generateRoom();
  }, []);

  const createLobby = async () => {
    setNamespace("/private_game");
    setRoomId(generatedRoom);
    setRoomSize(roomSizeInput);
    setJoiningGame(true);
    navigate(`/Play/${generatedRoom}`);
  };

  const joinLobby = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = roomInput.trim();
    if (!trimmed) return;
    setJoiningGame(true);
    await createRoom(trimmed);
    setRoomId(trimmed);
    setNamespace("/private_game");
    navigate(`/Play/${trimmed}`);
  };
  const onlineLobby = async () => {
    setJoiningGame(true);
    const roomId = await createRoom("public");
    setNamespace("/public_game");
    setRoomId(roomId);
    navigate(`/Play/${roomId}`);
  };
  return (
    <div className="lobby-card">
      <div className="lobby-header">
        <h1 className="lobby-title">Create a room or join one to play together.</h1>
      </div>
      <button className="lobby-button" id="online-game-button" onClick={onlineLobby} disabled={joiningGame}>
        Join online game
      </button>
      <div className="lobby-grid">
        <div className="lobby-panel">
          <h2>Create a lobby</h2>
          <p>Start a new game room and share the link.</p>
          <label htmlFor="roomSize">Players:</label>
          <select id="roomSize"
            name="roomSize"
            value={roomSizeInput}
            onChange={(e) => setRoomSizeInput(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <div></div>
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
      <h1 className="lobby-title" id="waiting" hidden={!joiningGame}>Please wait to join your game</h1>
    </div>

  );
}

export default Home;
