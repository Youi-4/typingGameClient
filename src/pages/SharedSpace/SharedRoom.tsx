import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSharedSpace } from "./SharedSpaceProvider";

export default function SharedRoom() {
  const { roomId: roomIdParam } = useParams();
  const { sharedData, connected, roomId, setRoomId } = useSharedSpace();

  useEffect(() => {
    setRoomId(roomIdParam || "global");
  }, [roomIdParam, setRoomId]);

  return (
    <div>
      <h2>Shared Space ({roomId}) {connected ? "🟢" : "🔴"}</h2>

      {/* <button onClick={() => sendSharedData("Hello everyone!", { mistakes: 0, WPM: 0, CPM: 0 })}> 
        Send
      </button> */}

      <ul>
        {sharedData.map((item, index) => (
          <li key={index}>
            <strong>{item.senderId}:</strong> {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
