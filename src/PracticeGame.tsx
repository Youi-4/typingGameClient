import { useState } from "react";

import "./styles.css";
import { RaceTrack } from "./features/typing-game/RaceTrack";
import { ResultsPanel } from "./features/typing-game/ResultsPanel";
import { getRandomPracticeText } from "./features/typing-game/practiceTexts";
import { useTypingRace } from "./features/typing-game/useTypingRace";
import type { TypeObject } from "./context/SharedSpaceContext";

const SOLO_ID = "solo";
const noop = (_: TypeObject) => {};

interface PracticeRoundProps {
  paragraph: string;
  characterNumber: number;
  onPlayAgain: () => void;
}

function PracticeRound({ paragraph, characterNumber, onPlayAgain }: PracticeRoundProps) {
  const race = useTypingRace({
    roomParagraph: paragraph,
    isInputDisabled: false,
    sendSharedData: noop,
    practiceMode: true,
  });

  const players: Array<[string, { senderId: string; senderName: string; characterNumber: number; message: string; typeObject: TypeObject }]> = [
    [
      SOLO_ID,
      {
        senderId: SOLO_ID,
        senderName: "",
        characterNumber,
        message: "",
        typeObject: race.snapshot,
      },
    ],
  ];

  return (
    <div className="container">
      <div className="lobby-form">
        <RaceTrack
          players={players}
          myUser={SOLO_ID}
          roomParagraphLength={paragraph.length}
          roomSize={1}
          playerStatsCache={{}}
          assignedRanks={{}}
          settledSenders={new Set()}
          loadPlayerStats={() => {}}
          hideCharacterOnComplete
        />
      </div>

      <input
        type="text"
        className="input-field"
        id="game-input-field"
        value={race.inputValue}
        onChange={race.handleInputChange}
        onKeyDown={race.handleKeyDown}
      />

      <ResultsPanel
        typingText={race.typingText}
        timeLeft={race.timeLeft}
        timeLabel="Time:"
        totalMistakes={race.totalMistakes}
        wpm={race.wpm}
        isFinished={race.isCompleted}
        onPlayAgain={onPlayAgain}
        showGraph={race.showGraph}
        graphData={race.wpmHistory}
        accuracy={race.accuracy}
      />
    </div>
  );
}

function PracticeGame() {
  const [paragraph, setParagraph] = useState(getRandomPracticeText);
  const [roundKey, setRoundKey] = useState(0);
  const [characterNumber, setCharacterNumber] = useState(() => Math.floor(Math.random() * 5));

  const playAgain = () => {
    setParagraph(getRandomPracticeText(paragraph));
    setCharacterNumber(Math.floor(Math.random() * 5));
    setRoundKey((k) => k + 1);
  };

  return (
    <PracticeRound
      key={roundKey}
      paragraph={paragraph}
      characterNumber={characterNumber}
      onPlayAgain={playAgain}
    />
  );
}

export default PracticeGame;
