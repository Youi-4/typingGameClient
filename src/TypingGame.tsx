// SpeedTypingGame.tsx
import React, {
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type KeyboardEvent
} from 'react';
import './styles.css';
import TypingArea from './TypingArea';
// import { useParams } from "react-router-dom";
import { useSharedSpace } from './services/SharedSpaceProvider';
const SpeedTypingGame: React.FC = () => {
    // const { roomId: roomIdParam } = useParams();
    // console.log(roomIdParam,"$$$$$$$$");
    // if(roomIdParam === undefined){
    //     console.log("HEYYYYYY")
    // }
    const {
        sharedData,
        sendSharedData,
        roomId,
        setRoomId,
        roomParagraph,
        roomStatus,
        characterNumber
    } = useSharedSpace();
    console.log("characterNumbercharacterNumbercharacterNumber:",characterNumber)
    const imgArrWalk = ["/walk_0.png", "/walk_1.png", "/walk_2.png", "/walk_3.png", "/walk_4.png", "/walk_5.png", "/walk_6.png", "/walk_7.png", "/walk_8.png", "/walk_9.png"];
    const imgArrRun = ["/run_0.png", "/run_1.png", "/run_2.png", "/run_3.png", "/run_4.png", "/run_5.png", "/run_6.png", "/run_7.png", "/run_8.png", "/run_9.png"];
    const idleImg = "/Idle_0.png";
    const [localImgCounts, setLocalImgCounts] = useState<Record<string, number>>({});
    const [paragraphMean, setParagraphMean] = useState<number>(0);
    const [typingText, setTypingText] = useState<React.JSX.Element[] | string>([]);
    const [inpFieldValue, setInpFieldValue] = useState<string>('');
    const maxTime: number = 90;
    const [timeLeft, setTimeLeft] = useState<number>(maxTime);
    const [charIndex, setCharIndex] = useState<number>(0);
    const [mistakes, setMistakes] = useState<number>(0);
    const [totalMistakes, setTotalMistakes] = useState<number>(0);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [WPM, setWPM] = useState<number>(0);
    const [isDisabled, setIsDisabled] = useState(true);
    const trackRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [charIndexBeforeMistake, setCharIndexBeforeMistake] = useState<number>(0);
    const [isActivelyTyping, setIsActivelyTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    sendSharedData({ totalMistakes, WPM, charIndex, charIndexBeforeMistake, mistakes,isActivelyTyping });


    const [step, setStep] = useState(0);
    const words = ["Waiting for Players to join...", "The Race begins in", "🔴🔴5🔴🔴", "🔴🔴4🔴🔴", "🔴🔴3🔴🔴", "🟡🟡2🟡🟡", "🟡🟡1🟡🟡", "🟢🟢Go!🟢🟢"];

    useEffect(() => {

        if (step == words.length) {
             setIsDisabled(false);
        }
        else if (roomStatus === "filled" && step < words.length) {
            const timer = setTimeout(() => {
                setStep(step + 1);
            }, (step === 1) ? 2000 : 1000);

            return () => clearTimeout(timer);
        }

    }, [step, roomStatus]);
    const loadParagraph = (senten: string): void => {
        const inputField = document.getElementsByClassName('input-field')[0] as HTMLInputElement;

        const focusInput = () => inputField?.focus();
        document.addEventListener("keydown", focusInput);
        const num: number = senten.split(' ').length + 1;
        setParagraphMean((senten.length - num) / num)

        const content = Array.from(senten).map((letter, index) => (
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
        setTotalMistakes(0);
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
                if (mistakes == 0) { setCharIndexBeforeMistake(charIndex); }
                setMistakes(prev => prev + 1);

                setTotalMistakes(prev => prev + 1);
                characters[charIndex].classList.add('wrong');
            }

            characters[charIndex].classList.remove('active');
            setCharIndex(prev => prev + 1);

            if (charIndex + 1 < characters.length) {
                characters[charIndex + 1].classList.add('active');
            } else {
                setIsTyping(false);
            }
            setIsActivelyTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsActivelyTyping(false);
            }, 1000);
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
        setTotalMistakes(0);
        setWPM(0);
        if (roomParagraph === null) return;
        loadParagraph(roomParagraph);

    };

    useEffect(() => {
        setRoomId(roomId);
    }, [roomId]);


    useEffect(() => {
        if (roomParagraph === null) return;
        loadParagraph(roomParagraph);
    }, [roomParagraph]);

    useEffect(() => {
        let wpm = Math.round(((charIndex - mistakes) / paragraphMean) / (maxTime - timeLeft) * 60);
        setWPM(wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm);
        let interval: ReturnType<typeof setInterval>;
        if ( isDisabled == false && timeLeft||isTyping && timeLeft > 0) {
            interval = setInterval(() => {
                sendSharedData({ totalMistakes, WPM, charIndex, charIndexBeforeMistake, mistakes,isActivelyTyping });
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTyping(false);
        }
        return () => clearInterval(interval);
    }, [isTyping, timeLeft,isDisabled]);


    const latestBySender = sharedData.reduce<Record<string, (typeof sharedData)[number]>>(
        (acc, item) => {
            const key = item.senderId || "unknown";
            acc[key] = item;
            return acc;
        },
        {}
    );

    useEffect(() => {
        const senderIds = Object.keys(latestBySender);

        if (senderIds.length === 0) return;
        const interval = setInterval(() => {
            setLocalImgCounts(prev => {
                const next = { ...prev };
                senderIds.forEach(id => { next[id] = ((next[id] ?? 0) + 1) % 10; });
                return next;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [Object.keys(latestBySender).sort().join(',')]);
    return (

        <div className="container">

            <div className='lobby-form'>
                <div >{step <= words.length && (
                    <h2 key={step} className="animate">
                        {words[step]}
                    </h2>
                    
                )}</div>


                {Object.entries(latestBySender).map(([senderId, item]) => (

                    <div key={senderId} className="play-panel">

                        <div className="play-items">

                            <div className='play-item'><b>{item.senderName}</b></div>
                            <div className='play-item'>
                                <div><b>mistakes:{item.typeObject?.totalMistakes ?? 0} </b></div>
                                <div > <b>WPM:{item.typeObject?.WPM ?? 0}</b></div>

                            </div>
                            <div ref={(el: HTMLDivElement | null) => {
                                trackRefs.current[senderId] = el;
                            }} className="race-track">
                                <img
                                    src={(item.typeObject.isActivelyTyping && !(item.typeObject.mistakes>0))?((item.typeObject.WPM > 45) ? `/Character${item.characterNumber}`+imgArrRun[localImgCounts[senderId] ?? 0] : `/Character${item.characterNumber}`+imgArrWalk[localImgCounts[senderId] ?? 0]):`/Character${item.characterNumber}`+idleImg}
                                    alt="moving"
                                    style={{
                                        left: `${(
                                            item.typeObject.mistakes > 0
                                                ? (item.typeObject.charIndexBeforeMistake)
                                                : (item.typeObject.charIndex)
                                        ) / (roomParagraph?.length ?? 1) * 100}%`,
                                        transition: "left 0.2s ease-out"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

            </div>
            <input
                type="text"
                className="input-field"
                id="game-input-field"
                value={inpFieldValue}
                onChange={initTyping}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
            />
            <TypingArea
                typingText={typingText}
                inpFieldValue={inpFieldValue}
                timeLeft={timeLeft}
                totalMistakes={totalMistakes}
                WPM={WPM}
                resetGame={resetGame}
            />

        </div>

    );
};

export default SpeedTypingGame;