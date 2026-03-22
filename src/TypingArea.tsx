
// Define the shape of the props
interface TypingAreaProps {
  typingText: React.JSX.Element[] | string;
  timeLeft: number;
  totalMistakes: number;
  WPM: number;
  resetGame: () => void;
  // Add '?' to make these optional

}

const TypingArea: React.FC<TypingAreaProps> = ({
  typingText,
  timeLeft,

  totalMistakes,
  WPM,
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
            <span>{totalMistakes}</span>
          </li>
          <li className="wpm">
            <p>WPM:</p>
            <span>{WPM}</span>
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