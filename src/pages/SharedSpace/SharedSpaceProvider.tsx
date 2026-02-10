import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type {ReactNode} from "react";
import { io, Socket } from "socket.io-client";

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
  paragraphIndex: number;
}

interface SharedSpaceContextType {
  sharedData: SharedMessage[];
  sendSharedData: (message: string, typeObject:TypeObject) => void;
  connected: boolean;
  roomId: string;
  setRoomId: (roomId: string) => void;
  roomParagraphIndex: number | null;
  setParagraphCount: (count: number) => void;
}

/* ------------------ Socket ------------------ */

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : "http://localhost:3000";

const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["polling", "websocket"], // start with polling, then upgrade
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

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
  const [sharedData, setSharedData] = useState<SharedMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("global");
  const [roomParagraphIndex, setRoomParagraphIndex] = useState<number | null>(
    null
  );
  const [paragraphCount, setParagraphCount] = useState<number>(0);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("receive-message", (data: SharedMessage) => {
      setSharedData((prev) => [...prev, data]);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("room-state", (data: RoomState) => {
      if (data.roomId === roomId) {
        setRoomParagraphIndex(data.paragraphIndex);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.off("disconnect");
      socket.off("room-state");
    };
  }, [roomId]);

  useEffect(() => {
    if (!connected) return;
    socket.emit("join-room", { roomId, paragraphCount });
    setSharedData([]);
  }, [connected, roomId, paragraphCount]);

  const sendSharedData = (message: string, typeObject: TypeObject) => {
    socket.emit("send-message", {
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
        roomParagraphIndex,
        setParagraphCount,
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
