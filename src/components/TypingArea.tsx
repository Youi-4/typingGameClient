import React from 'react';

interface TypingAreaProps {
  typingText: React.JSX.Element[] | string;
  timeLeft: number;
  totalMistakes: number;
  WPM: number;
  isFinished: boolean;
  onPlayAgain: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  typingText,
  timeLeft,
  totalMistakes,
  WPM,
  isFinished,
  onPlayAgain,
}) => {
  return (
    <div className="section">
      <div className="section1">
        <p id="paragraph">{typingText}</p>
      </div>
      <div className="section2">
        <ul className="resultDetails">
          <li className="time">
            <p>Time Left:</p>
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
