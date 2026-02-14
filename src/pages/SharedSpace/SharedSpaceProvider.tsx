import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {ReactNode} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "../../context/AuthProvider";
/* ------------------ Types ------------------ */
export interface TypeObject{
  mistakes:number;
  WPM:number;
  CPM:number;
}
export interface SharedMessage {
  senderId: string;
  senderName: string;
  message: string;
  typeObject:TypeObject;
}

export interface RoomState {
  roomId: string;
  paragraph: string;
}

interface SharedSpaceContextType {
  sharedData: SharedMessage[];
  sendSharedData: (message: string, typeObject:TypeObject) => void;
  connected: boolean;
  roomId: string;
  setRoomId: (roomId: string) => void;
  roomParagraph: string;
}

/* ------------------ Socket URL ------------------ */

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "http://localhost:3000");

/* ------------------ Context ------------------ */

const SharedSpaceContext = createContext<SharedSpaceContextType | undefined>(
  undefined
);

/* ------------------ Provider ------------------ */

interface SharedSpaceProviderProps {
  children: ReactNode;
}

export function SharedSpaceProvider({
  children,
}: SharedSpaceProviderProps) {
  const { isAuthenticated } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const [sharedData, setSharedData] = useState<SharedMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("global");
  const [roomParagraph, setRoomParagraph] = useState<string>("");

  // Create / destroy socket based on auth status
  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated — disconnect and clean up
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    // Authenticated — create the socket
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("receive-message", (data: SharedMessage) => {
      setSharedData((prev) => [...prev, data]);
    });

    socket.on("room-state", (data: RoomState) => {
      setRoomParagraph(data.paragraph);
    });

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.off("disconnect");
      socket.off("room-state");
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  // Join room when connected or roomId changes
  useEffect(() => {
    if (!connected || !socketRef.current) return;
    socketRef.current.emit("join-room", { roomId });
    setSharedData([]);
  }, [connected, roomId]);

  const sendSharedData = (message: string, typeObject: TypeObject) => {
    socketRef.current?.emit("send-message", {
      roomId,
      message,
      typeObject,
    });
  };

  return (
    <SharedSpaceContext.Provider
      value={{
        sharedData,
        sendSharedData,
        connected,
        roomId,
        setRoomId,
        roomParagraph,
      }}
    >
      {children}
    </SharedSpaceContext.Provider>
  );
}

/* ------------------ Hook ------------------ */

export function useSharedSpace(): SharedSpaceContextType {
  const context = useContext(SharedSpaceContext);

  if (!context) {
    throw new Error(
      "useSharedSpace must be used within a SharedSpaceProvider"
    );
  }

  return context;
}
