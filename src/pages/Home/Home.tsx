
import { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../services/apiGeneral";
import {useSharedSpace} from "../../services/SharedSpaceProvider"

function Home() {
  const { setNamespace,setRoomId } = useSharedSpace();
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState<string>("");
  const [joiningOnline, setJoiningOnline] = useState(false);

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

  const createLobby = async() => {
    // console.log(generatedRoom,"IODJOISJF");
    setNamespace("/private_game");
    setRoomId(generatedRoom);
    navigate(`/Play/${generatedRoom}`);
  };

  const joinLobby = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const trimmed = roomInput.trim();
    if (!trimmed) return;
    await createRoom(trimmed);
    setRoomId(trimmed);
    setNamespace("/private_game");
    navigate(`/Play/${trimmed}`);
  };
   const onlineLobby = async () =>{
    setJoiningOnline(true);
    const roomId = await createRoom("public");
    setNamespace("/public_game");
    setRoomId(roomId)
    navigate(`/Play/${roomId}`);
  };
  return (
    <div className="lobby-card">
      <div className="lobby-header">
        <h1 className="lobby-title">Create a room or join one to play together.</h1>
      </div>
          <button className="lobby-button" id="online-game-button" onClick={onlineLobby} disabled={joiningOnline}>
            {joiningOnline ? "Finding a game..." : "Join online game"}
          </button>
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
