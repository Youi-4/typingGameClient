import { useEffect, useRef, useState } from "react";

import type { SharedMessage } from "../../context/SharedSpaceContext";
import type { StatsDto } from "../../types/api";

const WALK_FRAMES = ["/walk_0.png", "/walk_1.png", "/walk_2.png", "/walk_3.png", "/walk_4.png", "/walk_5.png", "/walk_6.png", "/walk_7.png", "/walk_8.png", "/walk_9.png"];
const RUN_FRAMES = ["/run_0.png", "/run_1.png", "/run_2.png", "/run_3.png", "/run_4.png", "/run_5.png", "/run_6.png", "/run_7.png", "/run_8.png", "/run_9.png"];
const IDLE_FRAME = "/Idle_0.png";
const WALK_FRAME_MS = 130; // ~7.7fps — deliberate walking pace
const RUN_FRAME_MS = 75;   // ~13.3fps — snappy running pace

type AnimType = "walk" | "run" | "idle" | "completed";

function getAnimType(item: SharedMessage): AnimType {
  if (item.typeObject.isCompleted) return "completed";
  if (item.typeObject.isActivelyTyping && item.typeObject.mistakes === 0) {
    return item.typeObject.WPM > 45 ? "run" : "walk";
  }
  return "idle";
}

interface RaceTrackProps {
  players: Array<[string, SharedMessage]>;
  myUser: string;
  roomParagraphLength: number;
  roomSize: number | null;
  playerStatsCache: Record<string, StatsDto>;
  assignedRanks: Record<string, string>;
  settledSenders: Set<string>;
  loadPlayerStats: (senderId: string, senderName: string) => void;
  hideCharacterOnComplete?: boolean;
}

// Maps rank image filename to a settled track position so completed players
// spread out and don't stack on top of each other.
const RANK_SETTLED_POS: Record<string, number> = {
  "/1st.png": 5,
  "/2nd.png": 13,
  "/3rd.png": 21,
  "/4th.png": 29,
  "/5th.png": 37,
  "/6th.png": 45,
};

function getPlayerProgress(
  item: SharedMessage,
  senderId: string,
  settledSenders: Set<string>,
  assignedRanks: Record<string, string>,
) {
  if (item.typeObject.isCompleted && settledSenders.has(senderId)) {
    const rank = assignedRanks[senderId];
    return rank ? (RANK_SETTLED_POS[rank] ?? 5) : 5;
  }

  if (item.typeObject.mistakes > 0) {
    return item.typeObject.charIndexBeforeMistake;
  }

  return item.typeObject.charIndex;
}

// Returns a stable src for React to track. For animating players, always returns
// frame 0 so React never fights the DOM-driven animation loop between renders.
function getStaticSprite(senderId: string, item: SharedMessage, assignedRanks: Record<string, string>): string {
  if (item.typeObject.isCompleted) {
    return item.typeObject.mistakes === 0
      ? assignedRanks[senderId] ?? "/1st.png"
      : `/Character${item.characterNumber}${IDLE_FRAME}`;
  }

  if (item.typeObject.isActivelyTyping && item.typeObject.mistakes === 0) {
    const frames = item.typeObject.WPM > 45 ? RUN_FRAMES : WALK_FRAMES;
    return `/Character${item.characterNumber}${frames[0]}`;
  }

  return `/Character${item.characterNumber}${IDLE_FRAME}`;
}

export function RaceTrack({
  players,
  myUser,
  roomParagraphLength,
  roomSize,
  playerStatsCache,
  assignedRanks,
  settledSenders,
  loadPlayerStats,
  hideCharacterOnComplete = false,
}: RaceTrackProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // DOM refs for direct frame updates — bypasses React render cycle entirely
  const imgRefsRef = useRef<Record<string, HTMLImageElement | null>>({});
  const frameCountersRef = useRef<Record<string, number>>({});
  const lastFrameTimeRef = useRef<Record<string, number>>({});
  const prevAnimTypeRef = useRef<Record<string, AnimType>>({});

  // Always-current snapshot for the animation interval (no stale closure)
  const playersRef = useRef(players);
  const assignedRanksRef = useRef(assignedRanks);
  playersRef.current = players;
  assignedRanksRef.current = assignedRanks;

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

  // When a player's animation state changes (server-driven), reset counters so
  // the new animation starts cleanly from frame 0 with no carry-over delay.
  useEffect(() => {
    for (const [senderId, item] of players) {
      const newType = getAnimType(item);
      if (newType !== prevAnimTypeRef.current[senderId]) {
        prevAnimTypeRef.current[senderId] = newType;
        frameCountersRef.current[senderId] = 0;
        lastFrameTimeRef.current[senderId] = 0;
      }
    }
  }, [players]);

  // Animation loop via requestAnimationFrame — runs every display frame (~16ms)
  // but only advances a sprite when enough time has elapsed for that animation
  // type (walk is slower than run). Completely decoupled from server updates.
  useEffect(() => {
    let rafId: number;

    const animate = () => {
      const now = Date.now();

      for (const [senderId, item] of playersRef.current) {
        const animType = prevAnimTypeRef.current[senderId];
        if (animType !== "walk" && animType !== "run") continue;

        const img = imgRefsRef.current[senderId];
        if (!img) continue;

        const targetMs = animType === "run" ? RUN_FRAME_MS : WALK_FRAME_MS;
        if (now - (lastFrameTimeRef.current[senderId] ?? 0) < targetMs) continue;

        lastFrameTimeRef.current[senderId] = now;
        frameCountersRef.current[senderId] = ((frameCountersRef.current[senderId] ?? 0) + 1) % 10;
        const frames = animType === "run" ? RUN_FRAMES : WALK_FRAMES;
        img.src = `/Character${item.characterNumber}${frames[frameCountersRef.current[senderId]]}`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []); // No deps — this loop lives for the component lifetime

  return (
    <>
      {players.map(([senderId, item]) => {
        const progress = getPlayerProgress(item, senderId, settledSenders, assignedRanks);
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
                  {!(hideCharacterOnComplete && item.typeObject.isCompleted) && (
                    <img
                      ref={(el) => { imgRefsRef.current[senderId] = el; }}
                      src={getStaticSprite(senderId, item, assignedRanks)}
                      className={item.typeObject.isCompleted ? "rank-img" : "character-img"}
                      alt="moving"
                      style={{
                        left,
                        transition: "left 0.2s ease-out",
                      }}
                    />
                  )}
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
