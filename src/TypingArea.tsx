// TypingArea.tsx
import React, { type ChangeEvent, type KeyboardEvent } from 'react';

// Define the shape of the props
interface TypingAreaProps {
  typingText: React.JSX.Element[] | string;
  inpFieldValue: string;
  timeLeft: number;
  mistakes: number;
  WPM: number;
  CPM: number;
  resetGame: () => void;
  // Add '?' to make these optional
  initTyping?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  typingText,
  timeLeft,
  mistakes,
  WPM,
  CPM,
  resetGame,
}) => {
  return (
    <div className="section">
      <div className="section1">
        {/* The paragraph containing the span elements */}
        <p id="paragraph">{typingText}</p>
      </div>
      <div className="section2">
        <ul className="resultDetails">
          <li className="time">
            <p>Time Left:</p>
            <span>
              <b>{timeLeft}</b>s
            </span>
          </li>
          <li className="mistake">
            <p>Mistakes:</p>
            <span>{mistakes}</span>
          </li>
          <li className="wpm">
            <p>WPM:</p>
            <span>{WPM}</span>
          </li>
          <li className="cpm">
            <p>CPM:</p>
            <span>{CPM}</span>
          </li>
        </ul>
        <button onClick={resetGame} className="btn">
          Try Again
        </button>
        
      </div>
      
    </div>
  );
};

export default TypingArea;