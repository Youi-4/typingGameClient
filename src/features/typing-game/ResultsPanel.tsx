import type { ReactNode } from "react";

import TypingArea from "../../components/TypingArea";
import WpmGraph from "../../components/WpmGraph";
import type { WpmHistoryPoint } from "./types";

interface ResultsPanelProps {
  typingText: ReactNode;
  timeLeft: number;
  totalMistakes: number;
  wpm: number;
  isFinished: boolean;
  onPlayAgain: () => void;
  showGraph: boolean;
  graphData: WpmHistoryPoint[];
  accuracy: number;
}

export function ResultsPanel({
  typingText,
  timeLeft,
  totalMistakes,
  wpm,
  isFinished,
  onPlayAgain,
  showGraph,
  graphData,
  accuracy,
}: ResultsPanelProps) {
  return (
    <>
      <TypingArea
        typingText={typingText}
        timeLeft={timeLeft}
        totalMistakes={totalMistakes}
        WPM={wpm}
        isFinished={isFinished}
        onPlayAgain={onPlayAgain}
      />

      {showGraph && (
        <WpmGraph
          data={graphData}
          finalWpm={wpm}
          accuracy={accuracy}
        />
      )}
    </>
  );
}
