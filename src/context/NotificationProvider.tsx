import { useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuthContext } from "./useAuthContext";
import { fetchSocketToken } from "../services/authApi";
import { NotificationContext, type IncomingChallenge } from "./NotificationContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "http://localhost:3000");

const ACCEPTS_CHALLENGES_KEY = "typecrisp_accepts_challenges";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);

  const [incomingChallenge, setIncomingChallenge] = useState<IncomingChallenge | null>(null);
  const [pendingChallengeTarget, setPendingChallengeTarget] = useState<string | null>(null);
  const [acceptsChallenges, setAcceptsChallengesState] = useState<boolean>(() => {
    const stored = localStorage.getItem(ACCEPTS_CHALLENGES_KEY);
    return stored === null ? true : stored === "true";
  });

  const acceptsChallengesRef = useRef(acceptsChallenges);

  const setAcceptsChallenges = (value: boolean) => {
    acceptsChallengesRef.current = value;
    setAcceptsChallengesState(value);
    localStorage.setItem(ACCEPTS_CHALLENGES_KEY, String(value));
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const token = await fetchSocketToken();
        if (cancelled) return;

        const socket = io(SOCKET_URL + "/notifications", {
          withCredentials: true,
          auth: { token },
          transports: ["polling", "websocket"],
        });
        socketRef.current = socket;

        socket.on("challenge-incoming", (data: IncomingChallenge) => {
          if (!acceptsChallengesRef.current) {
            // silently decline
            socket.emit("challenge-response", {
              challengerUsername: data.fromUsername,
              accepted: false,
              roomId: data.roomId,
            });
            return;
          }
          setIncomingChallenge(data);
        });

        socket.on("challenge-accepted", () => {
          // The challenger is already in the room — they navigated there when they
          // sent the challenge. Just clear the pending state and notify the user.
          // Do NOT call setRoomId here; that would wipe roomParagraph via resetRoomState.
          setPendingChallengeTarget(null);
          toast.success("Your challenge was accepted! The race will begin shortly.");
        });

        socket.on("challenge-declined", ({ targetUsername }: { targetUsername: string }) => {
          setPendingChallengeTarget(null);
          toast.error(`${targetUsername} declined your challenge.`);
        });

        socket.on("challenge-error", ({ error }: { error: string }) => {
          setPendingChallengeTarget(null);
          toast.error(error);
        });
      } catch (err) {
        console.error("[notifications] failed to connect:", err);
      }
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const sendChallenge = (targetUsername: string, roomId: string) => {
    if (!socketRef.current) return;
    setPendingChallengeTarget(targetUsername);
    socketRef.current.emit("challenge-user", { targetUsername, roomId });
  };

  const respondToChallenge = (accepted: boolean) => {
    if (!incomingChallenge || !socketRef.current) return;
    socketRef.current.emit("challenge-response", {
      challengerUsername: incomingChallenge.fromUsername,
      accepted,
      roomId: incomingChallenge.roomId,
    });
    // Navigation is handled by the caller (Navigation.tsx handleAccept/handleDecline).
    setIncomingChallenge(null);
  };

  return (
    <NotificationContext.Provider value={{
      incomingChallenge,
      pendingChallengeTarget,
      sendChallenge,
      respondToChallenge,
      acceptsChallenges,
      setAcceptsChallenges,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
