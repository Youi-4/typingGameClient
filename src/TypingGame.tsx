// SpeedTypingGame.tsx
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    type ChangeEvent,
    type KeyboardEvent
} from 'react';
import './styles.css';
import TypingArea from './TypingArea';
import WpmGraph from './WpmGraph';
// import { useParams } from "react-router-dom";
import { useSharedSpace } from './services/SharedSpaceProvider';

    const imgArrWalk = ["/walk_0.png", "/walk_1.png", "/walk_2.png", "/walk_3.png", "/walk_4.png", "/walk_5.png", "/walk_6.png", "/walk_7.png", "/walk_8.png", "/walk_9.png"];
    const imgArrRun = ["/run_0.png", "/run_1.png", "/run_2.png", "/run_3.png", "/run_4.png", "/run_5.png", "/run_6.png", "/run_7.png", "/run_8.png", "/run_9.png"];
    const idleImg = "/Idle_0.png";
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
        roomSize,
        myId
    } = useSharedSpace();
    // console.log("characterNumbercharacterNumbercharacterNumber:",characterNumber)

    const [localImgCounts, setLocalImgCounts] = useState<Record<string, number>>({});
    const paragraphMeanRef = useRef(0);
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
    const preloadedImgs = useRef<HTMLImageElement[]>([]);
    const assignedRanks = useRef<Record<string, string>>({});
    const [settledSenders, setSettledSenders] = useState<Set<string>>(new Set());
    const completionTimeouts = useRef<Set<string>>(new Set());
    const [charIndexBeforeMistake, setCharIndexBeforeMistake] = useState<number>(0);
    const [isActivelyTyping, setIsActivelyTyping] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gameStartTimeRef = useRef<number | null>(null);
    const typeDataRef = useRef({ totalMistakes: 0, WPM: 0, charIndex: 0, charIndexBeforeMistake: 0, mistakes: 0, isActivelyTyping: false, isCompleted: false });
    const wpmHistoryRef = useRef<{ elapsed: number; wpm: number }[]>([]);
    const [wpmHistory, setWpmHistory] = useState<{ elapsed: number; wpm: number }[]>([]);
    const [showGraph, setShowGraph] = useState(false);
    const charactersRef = useRef<HTMLCollectionOf<HTMLElement>>(document.getElementsByClassName('char') as HTMLCollectionOf<HTMLElement>);
    useEffect(() => {
        const inputField = document.getElementById('game-input-field') as HTMLInputElement;
        const focusInput = () => inputField?.focus();
        document.addEventListener("keydown", focusInput);
        return () => document.removeEventListener("keydown", focusInput);
    }, []);

    useEffect(() => {
        if (roomParagraph) {
            sendSharedData({ totalMistakes, WPM, charIndex, charIndexBeforeMistake, mistakes, isActivelyTyping,isCompleted });
        }
    }, [roomParagraph]);

    useEffect(() => {
        if (!isCompleted) return;
        sendSharedData({ totalMistakes, WPM, charIndex, charIndexBeforeMistake, mistakes: 0, isActivelyTyping: false,isCompleted });
        setWpmHistory([...wpmHistoryRef.current]);
        setShowGraph(true);
    }, [isCompleted]);

    useEffect(() => {
        const allImgs = [...imgArrWalk, ...imgArrRun, idleImg];
        preloadedImgs.current = [0, 1, 2, 3, 4].flatMap(charNum =>
            allImgs.map(src => {
                const img = new Image();
                img.src = `/Character${charNum}${src}`;
                return img;
            })
        );
    }, []);


    const [step, setStep] = useState(0);
    const IntroCountDown = [(roomSize == 1)?"":"Waiting for Players to join...", "The Race begins in", "🔴🔴5🔴🔴", "🔴🔴4🔴🔴", "🔴🔴3🔴🔴", "🟡🟡2🟡🟡", "🟡🟡1🟡🟡", "🟢🟢Go!🟢🟢"];
    const rankRef = useRef(["/6th.png", "/5th.png", "/4th.png", "/3rd.png", "/2nd.png", "/1st.png"]);
    useEffect(() => {

        if (step == IntroCountDown.length) {
            setIsDisabled(false);
        }
        else if (roomStatus === "filled" && step < IntroCountDown.length) {
            const timer = setTimeout(() => {
                setStep(step + 1);
            }, (step === 1) ? 2000 : 1000);

            return () => clearTimeout(timer);
        }

    }, [step, roomStatus]);
    const loadParagraph = (senten: string): void => {
        const num: number = senten.split(' ').length + 1;
        paragraphMeanRef.current = (senten.length - num) / num;

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
        const characters = charactersRef.current;
        if (event.key === 'Backspace' && charIndex > 0 && charIndex <= characters.length && timeLeft > 0 && (characters[charIndex - 1].textContent != " " || mistakes > 0) && (charIndex <= roomParagraph.length && mistakes >0)) {

            if (characters[charIndex - 1].classList.contains('correct')) {
                characters[charIndex - 1].classList.remove('correct');
            }
            if (characters[charIndex - 1].classList.contains('wrong')) {
                characters[charIndex - 1].classList.remove('wrong');
                setMistakes(prev => prev - 1);
            }

            characters[charIndex]?.classList.remove('active');
            characters[charIndex - 1].classList.add('active');
            setCharIndex(prev => prev - 1);

        }
    }

    const initTyping = (event: ChangeEvent<HTMLInputElement>): void => {
        const characters = charactersRef.current;
        // Get only the last character typed
        let typedChar = event.target.value.slice(-1);
        // console.log(typedChar)
        if (charIndex < characters.length && timeLeft > 0) {
            let currentChar = characters[charIndex].innerText;

            if (!isTyping) setIsTyping(true);

            let currentMistakes = mistakes;
            if (typedChar === currentChar) {
                characters[charIndex].classList.add('correct');
            } else {
                if (mistakes == 0) { setCharIndexBeforeMistake(charIndex); }
                setMistakes(prev => prev + 1);
                currentMistakes++;
                setTotalMistakes(prev => prev + 1);
                characters[charIndex].classList.add('wrong');
            }

            characters[charIndex].classList.remove('active');
            setCharIndex(prev => prev + 1);

            if (charIndex + 1 < characters.length) {
                characters[charIndex + 1].classList.add('active');
            } else {
                setIsTyping(false);
                if(currentMistakes == 0 && charIndex + 1 >= roomParagraph.length){
                    setIsCompleted(true);
                }
            }
            setIsActivelyTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsActivelyTyping(false);
            }, 500);
        } else {
            setIsTyping(false);
        }
    };

    const resetGame = (): void => {
        Array.from(charactersRef.current).forEach((char) => {
            char.classList.remove('wrong', 'correct', 'active');
        });
        setIsTyping(false);
        setIsCompleted(false);
        setTimeLeft(maxTime);
        setCharIndex(0);
        setMistakes(0);
        setTotalMistakes(0);
        setWPM(0);
        wpmHistoryRef.current = [];
        setWpmHistory([]);
        setShowGraph(false);
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


    // Keep ref in sync every render so the data interval always sends fresh values
    useEffect(() => {
        typeDataRef.current = { totalMistakes, WPM, charIndex, charIndexBeforeMistake, mistakes, isActivelyTyping, isCompleted };
    });

    useEffect(() => {
        if (isCompleted || isDisabled) return;
        const dataInterval = setInterval(() => {
            sendSharedData(typeDataRef.current);
        }, 100);
        return () => clearInterval(dataInterval);
    }, [isDisabled, isCompleted]);

    // Timer uses wall-clock so event loop pressure from typing can't cause drift
    useEffect(() => {
        if (isDisabled || isCompleted) return;
        gameStartTimeRef.current = Date.now();
        const timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameStartTimeRef.current!) / 1000);
            const remaining = Math.max(0, maxTime - elapsed);
            setTimeLeft(remaining);
            if (elapsed > 0 && paragraphMeanRef.current > 0) {
                const { charIndex, mistakes } = typeDataRef.current;
                const wpm = Math.round(((charIndex - mistakes) / paragraphMeanRef.current) / elapsed * 60);
                const sanitized = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
                setWPM(sanitized);
                wpmHistoryRef.current.push({ elapsed, wpm: sanitized });
            }
            if (remaining <= 0) clearInterval(timerInterval);
        }, 1000);
        return () => clearInterval(timerInterval);
    }, [isDisabled, isCompleted]);


    const latestBySender = useMemo(() => sharedData.reduce<Record<string, (typeof sharedData)[number]>>(
        (acc, item) => {
            const key = item.senderId || "unknown";
            acc[key] = item;
            return acc;
        },
        {}
    ), [sharedData]);

    useEffect(() => {
        const senderIds = Object.keys(latestBySender);

        if (senderIds.length === 0) return;
        const interval = setInterval(() => {
            setLocalImgCounts(prev => {
                const next = { ...prev };
                senderIds.forEach(id => { next[id] = ((next[id] ?? 0) + 1) % 10; });
                return next;
            });
        }, 500);
        return () => clearInterval(interval);
    }, [Object.keys(latestBySender).sort().join(',')]);

    useEffect(() => {
        Object.entries(latestBySender).forEach(([senderId, item]) => {
            if (item.typeObject.isCompleted && !completionTimeouts.current.has(senderId)) {
                completionTimeouts.current.add(senderId);
                setTimeout(() => {
                    setSettledSenders(prev => new Set(prev).add(senderId));
                }, 800);
            }
        });
    }, [sharedData]);
    return (
        <>
        <div className="container">

            <div className='lobby-form'>
                <div >{step <= IntroCountDown.length && (
                    <h2 key={step} className="animate">
                        {IntroCountDown[step]}
                    </h2>

                )}</div>


                {Object.entries(latestBySender).map(([senderId, item]) => (

                    <div key={senderId} className="play-panel">

                        <div className="play-items">

                            <div className='play-item'><b>{ (senderId == myId && roomSize != 1)?item.senderName+"\n(You)":item.senderName}</b></div>
                            <div className='play-item'>
                                <div><b>mistakes:{item.typeObject?.totalMistakes ?? 0} </b></div>
                                <div > <b>WPM:{item.typeObject?.WPM ?? 0}</b></div>

                            </div>
                            <div ref={(el: HTMLDivElement | null) => {
                                trackRefs.current[senderId] = el;
                            }} className="race-track">
                                <img
                                    src={(!item.typeObject.isCompleted ) ? (item.typeObject.isActivelyTyping && !(item.typeObject.mistakes > 0)) ? ((item.typeObject.WPM > 45) ? `/Character${item.characterNumber}` + imgArrRun[localImgCounts[senderId] ?? 0] : `/Character${item.characterNumber}` + imgArrWalk[localImgCounts[senderId] ?? 0]) : `/Character${item.characterNumber}` + idleImg : (item.typeObject.mistakes == 0)?(assignedRanks.current[senderId] ?? (assignedRanks.current[senderId] = rankRef.current.pop() ?? "/1st.png")):`/Character${item.characterNumber}` + idleImg}
                                    className={(item.typeObject.isCompleted) ? "rank-img" : "character-img"}
                                    alt="moving"
                                    style={{
                                        left: `${(
                                            (item.typeObject.isCompleted && settledSenders.has(senderId)) ? 5 :
                                            item.typeObject.mistakes > 0
                                                ? (item.typeObject.charIndexBeforeMistake)
                                                : (item.typeObject.charIndex)
                                        ) / (roomParagraph?.length ?? 1) * 100+1}%`,
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

            {showGraph && (
                <WpmGraph
                    data={wpmHistory}
                    finalWpm={WPM}
                />
            )}

        </div>
        </>
    );
};

export default SpeedTypingGame;