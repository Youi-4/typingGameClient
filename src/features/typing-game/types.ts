import type { TypeObject } from "../../context/SharedSpaceContext";

export interface WpmHistoryPoint {
  elapsed: number;
  wpm: number;
}

export type TypingRaceSnapshot = TypeObject;
