import { useEffect, useState } from "react";

import type { SharedMessage } from "../../context/SharedSpaceContext";
import type { StatsDto } from "../../types/api";

const WALK_FRAMES = ["/walk_0.png", "/walk_1.png", "/walk_2.png", "/walk_3.png", "/walk_4.png", "/walk_5.png", "/walk_6.png", "/walk_7.png", "/walk_8.png", "/walk_9.png"];
const RUN_FRAMES = ["/run_0.png", "/run_1.png", "/run_2.png", "/run_3.png", "/run_4.png", "/run_5.png", "/run_6.png", "/run_7.png", "/run_8.png", "/run_9.png"];
const IDLE_FRAME = "/Idle_0.png";

interface RaceTrackProps {
  players: Array<[string, SharedMessage]>;
  myUser: string;
  roomParagraphLength: number;
  roomSize: number | null;
  localImgCounts: Record<string, number>;
  playerStatsCache: Record<string, StatsDto>;
  assignedRanks: Record<string, string>;
  settledSenders: Set<string>;
  loadPlayerStats: (senderId: string, senderName: string) => void;
}

function getPlayerProgress(item: SharedMessage, senderId: string, settledSenders: Set<string>) {
  if (item.typeObject.isCompleted && settledSenders.has(senderId)) {
    return 5;
  }

  if (item.typeObject.mistakes > 0) {
    return item.typeObject.charIndexBeforeMistake;
  }

  return item.typeObject.charIndex;
}

function getPlayerSprite(
  senderId: string,
  item: SharedMessage,
  localImgCounts: Record<string, number>,
  assignedRanks: Record<string, string>
) {
  if (item.typeObject.isCompleted) {
    return item.typeObject.mistakes === 0
      ? assignedRanks[senderId] ?? "/1st.png"
      : `/Character${item.characterNumber}${IDLE_FRAME}`;
  }

  if (item.typeObject.isActivelyTyping && item.typeObject.mistakes === 0) {
    const frames = item.typeObject.WPM > 45 ? RUN_FRAMES : WALK_FRAMES;
    return `/Character${item.characterNumber}${frames[localImgCounts[senderId] ?? 0]}`;
  }

  return `/Character${item.characterNumber}${IDLE_FRAME}`;
}

export function RaceTrack({
  players,
  myUser,
  roomParagraphLength,
  roomSize,
  localImgCounts,
  playerStatsCache,
  assignedRanks,
  settledSenders,
  loadPlayerStats,
}: RaceTrackProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  useEffect(() => {
    const allFrames = [...WALK_FRAMES, ...RUN_FRAMES, IDLE_FRAME];
    const images = [0, 1, 2, 3, 4].flatMap((characterNumber) => (
      allFrames.map((src) => {
        const img = new Image();
        img.src = `/Character${characterNumber}${src}`;
        return img;
      })
    ));

    return () => {
      images.length = 0;
    };
  }, []);

  return (
    <>
      {players.map(([senderId, item]) => {
        const progress = getPlayerProgress(item, senderId, settledSenders);
        const left = `${(progress / Math.max(roomParagraphLength, 1)) * 100 + 1}%`;
        const stats = playerStatsCache[senderId];

        return (
          <div key={senderId} className="play-panel">
            <div className="play-items" style={{ position: "relative" }}>
              <div className="play-item">
                <b>{senderId === myUser && roomSize !== 1 ? `${item.senderName} (You)` : item.senderName}</b>
              </div>

              <div className="play-item">
                <div><b>mistakes:{item.typeObject.totalMistakes ?? 0} </b></div>
                <div><b>WPM:{item.typeObject.WPM ?? 0}</b></div>
              </div>

              <div
                style={{ flex: 1, position: "relative" }}
                onMouseEnter={() => {
                  setHoveredPlayer(senderId);
                  loadPlayerStats(senderId, item.senderName);
                }}
                onMouseLeave={() => setHoveredPlayer(null)}
              >
                <div className="race-track">
                  <img
                    src={getPlayerSprite(senderId, item, localImgCounts, assignedRanks)}
                    className={item.typeObject.isCompleted ? "rank-img" : "character-img"}
                    alt="moving"
                    style={{
                      left,
                      transition: "left 0.2s ease-out",
                    }}
                  />
                </div>

                {hoveredPlayer === senderId && stats && (
                  <table className="player-tooltip" style={{ left }}>
                    <tbody>
                      <tr><td>Avg WPM</td><td>{Math.round(stats.race_avg)}</td></tr>
                      <tr><td>Best WPM</td><td>{stats.race_best}</td></tr>
                      <tr><td>Last WPM</td><td>{stats.race_last}</td></tr>
                      <tr><td>Races Won</td><td>{stats.race_won}</td></tr>
                      <tr><td>Races Completed</td><td>{stats.race_completed}</td></tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
