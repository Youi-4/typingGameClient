import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./useAuthContext";
import { fetchSocketToken, fetchGuestToken } from "../services/authApi";
import { SharedSpaceContext } from "./SharedSpaceContext";
import type { SharedMessage, RoomStatus, RoomState, TypeObject } from "./SharedSpaceContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "http://localhost:3000");

interface SharedSpaceProviderProps {
  children: ReactNode;
}

export function SharedSpaceProvider({ children }: SharedSpaceProviderProps) {
  const { isAuthenticated } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef("");
  const pendingLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLeaveRoomIdRef = useRef<string | null>(null);
  const [sharedData, setSharedData] = useState<SharedMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const [roomParagraph, setRoomParagraph] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<string>("");
  const [namespace, setNamespace] = useState<string>("");
  const [characterNumber, setCharacterNumber] = useState<number>(0);
  const [roomSize, setRoomSize] = useState<number | null>(null);
  const [myUser, setmyUser] = useState<string>("");
  const [guest, setGuest] = useState<boolean>(true);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

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

        socket.on("connect", () => { setConnected(true); setmyUser(socket.id ?? ""); if (isAuthenticated) { setGuest(false); } else { setGuest(true); } });
        socket.on("disconnect", () => { setConnected(false); });

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

        socket.on("room-status", (data: RoomStatus) => { setRoomStatus(data.status); });
        socket.on("room-state", (data: RoomState) => { setRoomParagraph(data.paragraph); setCharacterNumber(data.characterNumber); });
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
      if (pendingLeaveTimeoutRef.current) {
        clearTimeout(pendingLeaveTimeoutRef.current);
        pendingLeaveTimeoutRef.current = null;
        pendingLeaveRoomIdRef.current = null;
      }
        setConnected(false);
    };
  }, [isAuthenticated, namespace]);

  useEffect(() => {
    if (!connected || !socketRef.current) return;
    if (!roomId) return;
    setSharedData([]);
    setRoomStatus("");
    setRoomParagraph("");
    if (typeof roomSize === "number" && roomSize > 0) {
      socketRef.current.emit("join-room", { roomId, roomSize });
    } else {
      socketRef.current.emit("join-room", { roomId });
    }
  }, [roomId, connected]);

  const sendSharedData = (typeObject: TypeObject) => {
    socketRef.current?.emit("send-message", { roomId, typeObject });
  };

  const leaveRoom = (roomIdToLeave?: string) => {
    const activeRoomId = roomIdToLeave ?? roomIdRef.current;
    if (!socketRef.current || !activeRoomId) return;
    socketRef.current.emit("leave-room", { roomId: activeRoomId });
    setSharedData([]);
    setRoomStatus("");
    setRoomParagraph("");
    if (roomIdRef.current === activeRoomId) {
      setRoomId("");
      setRoomSize(null);
      roomIdRef.current = "";
    }
  };

  const scheduleLeaveRoom = (roomIdToLeave?: string) => {
    const activeRoomId = roomIdToLeave ?? roomIdRef.current;
    if (!activeRoomId) return;
    if (pendingLeaveTimeoutRef.current) {
      clearTimeout(pendingLeaveTimeoutRef.current);
    }
    pendingLeaveRoomIdRef.current = activeRoomId;
    pendingLeaveTimeoutRef.current = setTimeout(() => {
      leaveRoom(activeRoomId);
      pendingLeaveTimeoutRef.current = null;
      pendingLeaveRoomIdRef.current = null;
    }, 0);
  };

  const cancelScheduledLeaveRoom = (roomIdToKeep?: string) => {
    if (!pendingLeaveTimeoutRef.current) return;
    if (roomIdToKeep && pendingLeaveRoomIdRef.current !== roomIdToKeep) return;
    clearTimeout(pendingLeaveTimeoutRef.current);
    pendingLeaveTimeoutRef.current = null;
    pendingLeaveRoomIdRef.current = null;
  };

  return (
    <SharedSpaceContext.Provider value={{
      sharedData, sendSharedData, leaveRoom, scheduleLeaveRoom, cancelScheduledLeaveRoom,
      connected, roomId, setRoomId,
      roomParagraph, roomStatus, namespace, setNamespace, characterNumber,
      setRoomSize, roomSize, myUser, guest,
    }}>
      {children}
    </SharedSpaceContext.Provider>
  );
}
