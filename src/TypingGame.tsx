import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./styles.css";
import { useSharedSpace } from "./context/useSharedSpace";
import { createRoom, getStatsByUsername, updateStats } from "./services/apiGeneral";
import { CountdownBanner } from "./features/typing-game/CountdownBanner";
import { RaceTrack } from "./features/typing-game/RaceTrack";
import { ResultsPanel } from "./features/typing-game/ResultsPanel";
import { useRoomLifecycle } from "./features/typing-game/useRoomLifecycle";
import { useTypingRace } from "./features/typing-game/useTypingRace";
import type { StatsDto } from "./types/api";

function SpeedTypingGame() {
  const navigate = useNavigate();
  const {
    sharedData,
    sendSharedData,
    scheduleLeaveRoom,
    cancelScheduledLeaveRoom,
    roomId,
    setRoomId,
    roomParagraph,
    roomStatus,
    roomSize,
    namespace,
    setNamespace,
    setRoomSize,
    myUser,
    guest,
  } = useSharedSpace();

  const [localImgCounts, setLocalImgCounts] = useState<Record<string, number>>({});
  const [assignedRanks, setAssignedRanks] = useState<Record<string, string>>({});
  const [settledSenders, setSettledSenders] = useState<Set<string>>(new Set());
  const [playerStatsCache, setPlayerStatsCache] = useState<Record<string, StatsDto>>({});
  const completionSubmittedRef = useRef(false);
  const completedPlayersRef = useRef<Set<string>>(new Set());
  const settleTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const rankPoolRef = useRef(["/6th.png", "/5th.png", "/4th.png", "/3rd.png", "/2nd.png", "/1st.png"]);

  const latestBySender = useMemo(
    () => sharedData.reduce<Record<string, (typeof sharedData)[number]>>(
      (accumulator, item) => {
        const senderKey = item.senderId || "unknown";
        accumulator[senderKey] = item;
        return accumulator;
      },
      {}
    ),
    [sharedData]
  );

  const playerEntries = useMemo(
    () => Object.entries(latestBySender),
    [latestBySender]
  );

  const { countdownMessage, isInputDisabled } = useRoomLifecycle({
    roomId,
    roomSize,
    roomStatus,
    scheduleLeaveRoom,
    cancelScheduledLeaveRoom,
  });

  const typingRace = useTypingRace({
    roomParagraph,
    isInputDisabled,
    sendSharedData,
  });

  useEffect(() => {
    const isFinished = typingRace.isCompleted || typingRace.timeLeft === 0;
    if (!isFinished || completionSubmittedRef.current) {
      return;
    }

    completionSubmittedRef.current = true;
    const hasOtherPlayers = playerEntries.some(([senderId]) => senderId !== myUser);
    const won = typingRace.isCompleted && hasOtherPlayers && !playerEntries.some(
      ([senderId, item]) => senderId !== myUser && item.typeObject.isCompleted
    );

    if (!hasOtherPlayers || guest) {
      return;
    }

    updateStats(typingRace.wpm, won)
      .then(() => {
        setPlayerStatsCache((current) => {
          const next = { ...current };
          delete next[myUser];
          return next;
        });
      })
      .catch(console.error);
  }, [guest, myUser, playerEntries, typingRace.isCompleted, typingRace.timeLeft, typingRace.wpm]);

  const playerIdsKey = playerEntries.map(([senderId]) => senderId).sort().join(",");
  useEffect(() => {
    if (playerEntries.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setLocalImgCounts((current) => {
        const next = { ...current };
        for (const [senderId] of playerEntries) {
          next[senderId] = ((next[senderId] ?? 0) + 1) % 10;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [playerEntries, playerIdsKey]);

  useEffect(() => {
    for (const [senderId, item] of playerEntries) {
      if (!item.typeObject.isCompleted || completedPlayersRef.current.has(senderId)) {
        continue;
      }

      completedPlayersRef.current.add(senderId);
      if (!assignedRanks[senderId] && item.typeObject.mistakes === 0) {
        const rank = rankPoolRef.current.pop() ?? "/1st.png";
        setAssignedRanks((current) => ({ ...current, [senderId]: rank }));
      }

      const timeoutId = setTimeout(() => {
        setSettledSenders((current) => {
          const next = new Set(current);
          next.add(senderId);
          return next;
        });
      }, 800);
      settleTimeoutsRef.current.set(senderId, timeoutId);
    }
  }, [assignedRanks, playerEntries]);

  useEffect(() => {
    return () => {
      for (const timeoutId of settleTimeoutsRef.current.values()) {
        clearTimeout(timeoutId);
      }
      settleTimeoutsRef.current.clear();
    };
  }, []);

  const loadPlayerStats = (senderId: string, senderName: string) => {
    if (playerStatsCache[senderId]) {
      return;
    }

    getStatsByUsername(senderName)
      .then((stats) => {
        setPlayerStatsCache((current) => ({ ...current, [senderId]: stats }));
      })
      .catch(() => {});
  };

  const playAgain = async (): Promise<void> => {
    const isPublicGame = namespace === "/public_game";
    const nextRoomId = await createRoom(isPublicGame ? "public" : "private");
    setNamespace(namespace);
    setRoomSize(isPublicGame ? null : roomSize);
    setRoomId(nextRoomId);
    navigate(`/Play/${nextRoomId}`);
  };

  return (
    <div className="container">
      <div className="lobby-form">
        <CountdownBanner message={countdownMessage} />

        <RaceTrack
          players={playerEntries}
          myUser={myUser}
          roomParagraphLength={roomParagraph.length}
          roomSize={roomSize}
          localImgCounts={localImgCounts}
          playerStatsCache={playerStatsCache}
          assignedRanks={assignedRanks}
          settledSenders={settledSenders}
          loadPlayerStats={loadPlayerStats}
        />
      </div>

      <input
        type="text"
        className="input-field"
        id="game-input-field"
        value={typingRace.inputValue}
        onChange={typingRace.handleInputChange}
        onKeyDown={typingRace.handleKeyDown}
        disabled={isInputDisabled}
      />

      <ResultsPanel
        typingText={typingRace.typingText}
        timeLeft={typingRace.timeLeft}
        totalMistakes={typingRace.totalMistakes}
        wpm={typingRace.wpm}
        isFinished={typingRace.isCompleted || typingRace.timeLeft === 0}
        onPlayAgain={playAgain}
        showGraph={typingRace.showGraph}
        graphData={typingRace.wpmHistory}
        accuracy={typingRace.accuracy}
      />
    </div>
  );
}

export default SpeedTypingGame;
