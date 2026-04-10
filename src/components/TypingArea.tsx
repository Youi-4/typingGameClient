import type { ReactNode } from 'react';

interface TypingAreaProps {
  typingText: ReactNode;
  timeLeft: number;
  totalMistakes: number;
  WPM: number;
  isFinished: boolean;
  onPlayAgain: () => void;
  timeLabel?: string;
}

const TypingArea = ({
  typingText,
  timeLeft,
  totalMistakes,
  WPM,
  isFinished,
  onPlayAgain,
  timeLabel = "Time Left:",
}: TypingAreaProps) => {
  return (
    <div className="section">
      <div className="section1">
        <p id="paragraph">{typingText}</p>
      </div>
      <div className="section2">
        <ul className="resultDetails">
          <li className="time">
            <p>{timeLabel}</p>
            <span><b>{timeLeft}</b>s</span>
          </li>
          <li className="mistake">
            <p>Mistakes:</p>
            <span>{totalMistakes}</span>
          </li>
          <li className="wpm">
            <p>WPM:</p>
            <span>{WPM}</span>
          </li>
        </ul>
        {isFinished && (
          <button onClick={onPlayAgain} className="lobby-button">
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};

export default TypingArea;
