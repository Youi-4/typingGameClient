import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "../context/AuthProvider";
import { fetchSocketToken, fetchGuestToken } from "./authApi";
/* ------------------ Types ------------------ */
export interface TypeObject {
  totalMistakes: number;
  WPM: number;
  charIndex: number;
  charIndexBeforeMistake: number;
  mistakes: number;
  isActivelyTyping:boolean;
  isCompleted:boolean;
}
export interface SharedMessage {
  senderId: string;
  senderName: string;
  characterNumber:number;
  message: string;
  typeObject: TypeObject;
}

export interface RoomState {
  roomId: string;
  paragraph: string;
  characterNumber:number;
}
export interface RoomStatus {
  status: string;
}

interface SharedSpaceContextType {
  sharedData: SharedMessage[];
  sendSharedData: (typeObject: TypeObject) => void;
  connected: boolean;
  roomId: string;
  setRoomId: (roomId: string) => void;
  roomParagraph: string;
  roomStatus: string;
  namespace: string;
  setNamespace: (ns: string) => void;
  characterNumber:number;
  setRoomSize:(roomSize:number) => void;
  roomSize:number;
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
  const [roomId, setRoomId] = useState<string>("");
  const [roomParagraph, setRoomParagraph] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<string>("");
  const [namespace, setNamespace] = useState<string>("")
  const [characterNumber, setCharacterNumber] = useState<number>(0)
  const [roomSize, setRoomSize] = useState<number>(0);
  useEffect(() => {
    let cancelled = false;

    const connectSocket = async () => {
      try {
        const socketToken = isAuthenticated
          ? await fetchSocketToken()
          : await fetchGuestToken();
        if (cancelled) return;

        const socket = io(SOCKET_URL + namespace, {
          withCredentials: true,
          auth: { token: socketToken },
          transports: ["polling", "websocket"],
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
        });
        socketRef.current = socket;

        socket.on("connect", () => setConnected(true));

        socket.on("disconnect", () => {
          setConnected(false);
        });

        socket.on("receive-message", (data: SharedMessage) => {
          setSharedData((prev) => {
            const map = new Map(prev.map(m => [m.senderId, m]));
            map.set(data.senderId, data);
            return Array.from(map.values());
          });
        });

        socket.on("batch-update", (batch: SharedMessage[]) => {
          setSharedData((prev) => {
            const map = new Map(prev.map(m => [m.senderId, m]));
            for (const msg of batch) map.set(msg.senderId, msg);
            return Array.from(map.values());
          });
        });

        socket.on("user-left", ({ senderId }: { senderId: string }) => {
          setSharedData((prev) => prev.filter((msg) => msg.senderId !== senderId));
        });

        socket.on("room-status", (data: RoomStatus) => {
          setRoomStatus(data.status);
        });
        socket.on("room-state", (data: RoomState) => {
          setRoomParagraph(data.paragraph);
          setCharacterNumber(data.characterNumber);
        });
      } catch (err) {
        console.error("Failed to get socket token:", err);
      }
    };

    connectSocket();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("receive-message");
        socketRef.current.off("batch-update");
        socketRef.current.off("user-left");
        socketRef.current.off("disconnect");
        socketRef.current.off("room-state");
        socketRef.current.off("room-status");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [isAuthenticated, namespace]);

  // Join room when connected or roomId changes
  useEffect(() => {
    if (!connected || !socketRef.current) return;
    if(roomSize !== undefined){
      socketRef.current.emit("join-room", { roomId,roomSize });
    }else{
      socketRef.current.emit("join-room", { roomId });
    }
    
    setSharedData([]);
  }, [roomId,connected]);

  const sendSharedData = (typeObject: TypeObject) => {
    socketRef.current?.emit("send-message", {
      roomId,
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
        roomStatus,
        namespace,
        setNamespace,
        characterNumber,
        setRoomSize,
        roomSize
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
