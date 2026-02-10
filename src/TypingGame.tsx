// SpeedTypingGame.tsx
import React, {
    useState,
    useEffect,
    type ChangeEvent,
    type KeyboardEvent
} from 'react';
import './styles.css';
import TypingArea from './TypingArea';
import { paragraphs, paragraphWordMeans } from './sentences';
import { useParams } from "react-router-dom";
import { useSharedSpace } from './pages/SharedSpace/SharedSpaceProvider';
const SpeedTypingGame: React.FC = () => {
    const { roomId: roomIdParam } = useParams();
    const {
        sharedData,
        sendSharedData,
        connected,
        roomId,
        setRoomId,
        roomParagraphIndex,
        setParagraphCount,
    } = useSharedSpace();
    const sentence: string[] = paragraphs;
    const [paragraphMean, setParagraphMean] = useState<number>(0);
    const [typingText, setTypingText] = useState<React.JSX.Element[] | string>([]);
    const [inpFieldValue, setInpFieldValue] = useState<string>('');
    const maxTime: number = 60;
    const [timeLeft, setTimeLeft] = useState<number>(maxTime);
    const [charIndex, setCharIndex] = useState<number>(0);
    const [mistakes, setMistakes] = useState<number>(0);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [WPM, setWPM] = useState<number>(0);
    const [CPM, setCPM] = useState<number>(0);
    const loadParagraph = (index: number): void => {
        const ranIndex = Math.max(0, Math.min(index, paragraphs.length - 1));
        const inputField = document.getElementsByClassName('input-field')[0] as HTMLInputElement;

        const focusInput = () => inputField?.focus();
        document.addEventListener("keydown", focusInput);
        setParagraphMean(paragraphWordMeans(sentence[ranIndex]))

        const content = Array.from(sentence[ranIndex]).map((letter, index) => (
            <span
                key={index}
                style={{ color: (letter !== ' ') ? 'black' : 'transparent' }}
                className={`char ${index === 0 ? 'active' : ''}`}
            >
                {letter}
            </span>
        ));

        setTypingText(content);
        setInpFieldValue('');
        setCharIndex(0);
        setMistakes(0);
        setIsTyping(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        const characters = document.querySelectorAll<HTMLSpanElement>('.char');
        if (event.key === 'Backspace' && charIndex > 0 && charIndex < characters.length && timeLeft > 0 && (characters[charIndex - 1].textContent != " " || mistakes > 0)) {

            if (characters[charIndex - 1].classList.contains('correct')) {
                characters[charIndex - 1].classList.remove('correct');
            }
            if (characters[charIndex - 1].classList.contains('wrong')) {
                characters[charIndex - 1].classList.remove('wrong');
                setMistakes(prev => prev - 1);
            }

            characters[charIndex].classList.remove('active');
            characters[charIndex - 1].classList.add('active');
            setCharIndex(prev => prev - 1);

            // Recalculate stats
            let cpm = (charIndex - mistakes - 1) * (60 / (maxTime - timeLeft));
            setCPM(cpm < 0 || !cpm || cpm === Infinity ? 0 : parseInt(cpm.toString(), 10));
        }
    }

    const initTyping = (event: ChangeEvent<HTMLInputElement>): void => {
        const characters = document.querySelectorAll<HTMLSpanElement>('.char');
        // Get only the last character typed
        let typedChar = event.target.value.slice(-1);
        // console.log(typedChar)
        if (charIndex < characters.length && timeLeft > 0) {
            let currentChar = characters[charIndex].innerText;

            if (!isTyping) setIsTyping(true);

            if (typedChar === currentChar) {
                characters[charIndex].classList.add('correct');
            } else {
                setMistakes(prev => prev + 1);
                characters[charIndex].classList.add('wrong');
            }

            characters[charIndex].classList.remove('active');
            setCharIndex(prev => prev + 1);

            if (charIndex + 1 < characters.length) {
                characters[charIndex + 1].classList.add('active');
            } else {
                setIsTyping(false);
            }

        } else {
            setIsTyping(false);
        }
    };

    const resetGame = (): void => {
        const characters = document.querySelectorAll<HTMLSpanElement>('.char');
        characters.forEach((char) => {
            // This removes the classes if they exist, and does nothing if they don't
            char.classList.remove('wrong', 'correct', 'active');
        });
        setIsTyping(false);
        setTimeLeft(maxTime);
        setCharIndex(0);
        setMistakes(0);
        setCPM(0);
        setWPM(0);
        if (roomParagraphIndex === null) return;
        loadParagraph(roomParagraphIndex);

    };

    useEffect(() => {
        setRoomId(roomIdParam || "global");
        setParagraphCount(paragraphs.length);
    }, [roomIdParam, setRoomId, setParagraphCount]);

    useEffect(() => {
        if (roomParagraphIndex === null) return;
        loadParagraph(roomParagraphIndex);
    }, [roomParagraphIndex]);

    useEffect(() => {
        let wpm = Math.round(((charIndex - mistakes) / paragraphMean) / (maxTime - timeLeft) * 60);
        setWPM(wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm);
        let interval: ReturnType<typeof setInterval>;
        if (isTyping && timeLeft > 0) {
            sendSharedData("Hello everyone!", { mistakes, WPM, CPM })
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTyping(false);
        }
        return () => clearInterval(interval);
    }, [isTyping, timeLeft]);

    
    const latestBySender = sharedData.reduce<Record<string, (typeof sharedData)[number]>>(
        (acc, item) => {
            const key = item.senderId || "unknown";
            acc[key] = item;
            return acc;
        },
        {}
    );
    
    return (

        <div className="container">
            <div className='lobby-form'>
                <h2>Shared Space ({roomId}) {connected ? "🟢" : "🔴"}</h2>

                <button onClick={() => sendSharedData("Hello everyone!", { mistakes, WPM, CPM })}>
                    Send
                </button>

                {Object.entries(latestBySender).map(([senderId, item]) => (
                    
                    <div key={senderId} className="play-panel">

                        <div className="play-items">
                            <div className='play-item'>{item.senderName}</div>
                            <div className='play-item'>
                                <div>mistakes:{item.typeObject?.mistakes ?? 0} </div>
                                <div >WPM:{item.typeObject?.WPM ?? 0}</div>
                            </div>

                        </div>
                    </div>
                ))}

            </div>
            <input
                type="text"
                className="input-field"
                value={inpFieldValue}
                onChange={initTyping}
                onKeyDown={handleKeyDown}
            />
            <TypingArea
                typingText={typingText}
                inpFieldValue={inpFieldValue}
                timeLeft={timeLeft}
                mistakes={mistakes}
                WPM={WPM}
                CPM={CPM}
                resetGame={resetGame}
            />

        </div>

    );
};

export default SpeedTypingGame;