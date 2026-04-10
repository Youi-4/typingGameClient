import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { TypeObject } from "../../context/SharedSpaceContext";
import type { TypingRaceSnapshot, WpmHistoryPoint } from "./types";

interface UseTypingRaceOptions {
  roomParagraph: string;
  isInputDisabled: boolean;
  sendSharedData: (typeObject: TypeObject) => void;
}

const MAX_TIME = 60;
function buildTypingNodes(sentence: string): ReactNode {
  return Array.from(sentence).map((letter, index) => (
    <span
      key={index}
      className={`char ${index === 0 ? "active" : ""}${letter === " " ? " char-space" : ""}`}
    >
      {letter}
    </span>
  ));
}

function getCharacters() {
  return document.getElementsByClassName("char") as HTMLCollectionOf<HTMLElement>;
}

export function useTypingRace({
  roomParagraph,
  isInputDisabled,
  sendSharedData,
}: UseTypingRaceOptions) {
  const paragraphMeanRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);
  const sendSharedDataRef = useRef(sendSharedData);
  const typeDataRef = useRef<TypingRaceSnapshot>({
    totalMistakes: 0,
    WPM: 0,
    charIndex: 0,
    charIndexBeforeMistake: 0,
    mistakes: 0,
    isActivelyTyping: false,
    isCompleted: false,
  });
  const wpmHistoryRef = useRef<WpmHistoryPoint[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [charIndex, setCharIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [charIndexBeforeMistake, setCharIndexBeforeMistake] = useState(0);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<WpmHistoryPoint[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  const snapshot = useMemo<TypingRaceSnapshot>(() => ({
    totalMistakes,
    WPM: wpm,
    charIndex,
    charIndexBeforeMistake,
    mistakes,
    isActivelyTyping,
    isCompleted,
  }), [
    charIndex,
    charIndexBeforeMistake,
    isActivelyTyping,
    isCompleted,
    mistakes,
    totalMistakes,
    wpm,
  ]);

  const typingText = useMemo(() => buildTypingNodes(roomParagraph), [roomParagraph]);

  useEffect(() => {
    const focusInput = () => {
      const inputField = document.getElementById("game-input-field") as HTMLInputElement | null;
      inputField?.focus();
    };

    document.addEventListener("keydown", focusInput);
    return () => document.removeEventListener("keydown", focusInput);
  }, []);

  useEffect(() => {
    sendSharedDataRef.current = sendSharedData;
  }, [sendSharedData]);

  useEffect(() => {
    typeDataRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!roomParagraph) {
      return;
    }

    const wordCount = roomParagraph.split(" ").length + 1;
    const resetSnapshot: TypingRaceSnapshot = {
      totalMistakes: 0,
      WPM: 0,
      charIndex: 0,
      charIndexBeforeMistake: 0,
      mistakes: 0,
      isActivelyTyping: false,
      isCompleted: false,
    };
    paragraphMeanRef.current = (roomParagraph.length - wordCount) / wordCount;
    typeDataRef.current = resetSnapshot;
    wpmHistoryRef.current = [];
    gameStartTimeRef.current = null;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    sendSharedDataRef.current(resetSnapshot);
  }, [roomParagraph]);

  useEffect(() => {
    if (!isCompleted) {
      return;
    }

    sendSharedDataRef.current({
      ...typeDataRef.current,
      mistakes: 0,
      isActivelyTyping: false,
      isCompleted: true,
    });
    setWpmHistory([...wpmHistoryRef.current]);
    setShowGraph(true);
  }, [isCompleted]);

  useEffect(() => {
    if (isInputDisabled || isCompleted) {
      return;
    }

    const dataInterval = setInterval(() => {
      sendSharedDataRef.current(typeDataRef.current);
    }, 100);

    return () => clearInterval(dataInterval);
  }, [isCompleted, isInputDisabled]);

  useEffect(() => {
    if (isInputDisabled || isCompleted) {
      return;
    }

    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }

    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current!) / 1000);
      const remaining = Math.max(0, MAX_TIME - elapsed);
      setTimeLeft(remaining);

      if (elapsed > 0 && paragraphMeanRef.current > 0) {
        const liveSnapshot = typeDataRef.current;
        const nextWpm = Math.round(
          (((liveSnapshot.charIndex - liveSnapshot.mistakes) / paragraphMeanRef.current) / elapsed) * 60
        );
        const sanitizedWpm = nextWpm > 0 && Number.isFinite(nextWpm) ? nextWpm : 0;
        setWpm(sanitizedWpm);
        wpmHistoryRef.current.push({ elapsed, wpm: sanitizedWpm });
      }

      if (remaining <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isCompleted, isInputDisabled]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const characters = getCharacters();
    if (
      event.key === "Backspace" &&
      charIndex > 0 &&
      charIndex <= characters.length &&
      timeLeft > 0 &&
      (characters[charIndex - 1].textContent !== " " || mistakes > 0) &&
      charIndex <= roomParagraph.length &&
      mistakes > 0
    ) {
      if (characters[charIndex - 1].classList.contains("correct")) {
        characters[charIndex - 1].classList.remove("correct");
      }

      if (characters[charIndex - 1].classList.contains("wrong")) {
        characters[charIndex - 1].classList.remove("wrong");
        setMistakes((current) => current - 1);
      }

      characters[charIndex]?.classList.remove("active");
      characters[charIndex - 1].classList.add("active");
      setCharIndex((current) => current - 1);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const characters = getCharacters();
    const typedChar = event.target.value.slice(-1);
    setInputValue("");

    if (charIndex < characters.length && timeLeft > 0) {
      const currentChar = characters[charIndex].innerText;

      if (!isTyping) {
        setIsTyping(true);
      }

      let currentMistakes = mistakes;
      if (typedChar === currentChar) {
        characters[charIndex].classList.add("correct");
      } else {
        if (mistakes === 0) {
          setCharIndexBeforeMistake(charIndex);
        }
        setMistakes((current) => current + 1);
        currentMistakes += 1;
        setTotalMistakes((current) => current + 1);
        characters[charIndex].classList.add("wrong");
      }

      characters[charIndex].classList.remove("active");
      setCharIndex((current) => current + 1);

      if (charIndex + 1 < characters.length) {
        characters[charIndex + 1].classList.add("active");
      } else {
        setIsTyping(false);
        if (currentMistakes === 0 && charIndex + 1 >= roomParagraph.length) {
          setIsCompleted(true);
        }
      }

      setIsActivelyTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsActivelyTyping(false);
      }, 500);
      return;
    }

    setIsTyping(false);
  };

  const accuracy = roomParagraph.length
    ? Math.round((roomParagraph.length / (roomParagraph.length + totalMistakes)) * 10000) / 100
    : 0;

  return {
    accuracy,
    handleInputChange,
    handleKeyDown,
    inputValue,
    isCompleted,
    showGraph,
    timeLeft,
    totalMistakes,
    typingText,
    wpm,
    wpmHistory,
  };
}
