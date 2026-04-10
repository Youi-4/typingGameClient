import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useTypingRace } from "./useTypingRace";
import type { TypeObject } from "../../context/SharedSpaceContext";

// ── Test harness ────────────────────────────────────────────────────────
// Renders the hook's typingText (so the DOM has `.char` spans) and exposes
// the hook's return values via data-testid attributes.

let sendSharedData: ReturnType<typeof vi.fn<(t: TypeObject) => void>>;

function TestHarness({
  roomParagraph,
  isInputDisabled = false,
}: {
  roomParagraph: string;
  isInputDisabled?: boolean;
}) {
  const race = useTypingRace({ roomParagraph, isInputDisabled, sendSharedData });

  return (
    <div>
      <div data-testid="typing-text">{race.typingText}</div>
      <input
        data-testid="game-input"
        id="game-input-field"
        value={race.inputValue}
        onChange={race.handleInputChange}
        onKeyDown={race.handleKeyDown}
      />
      <div data-testid="wpm">{race.wpm}</div>
      <div data-testid="mistakes">{race.totalMistakes}</div>
      <div data-testid="time-left">{race.timeLeft}</div>
      <div data-testid="completed">{String(race.isCompleted)}</div>
      <div data-testid="accuracy">{race.accuracy}</div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function typeChar(char: string) {
  fireEvent.change(screen.getByTestId("game-input"), {
    target: { value: char },
  });
}

function pressBackspace() {
  fireEvent.keyDown(screen.getByTestId("game-input"), { key: "Backspace" });
}

function chars() {
  return document.getElementsByClassName("char");
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("useTypingRace", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    });
    sendSharedData = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  // ── Initial state ───────────────────────────────────────────────────

  it("initializes with default values", () => {
    render(<TestHarness roomParagraph="hello" />);

    expect(screen.getByTestId("time-left").textContent).toBe("60");
    expect(screen.getByTestId("wpm").textContent).toBe("0");
    expect(screen.getByTestId("mistakes").textContent).toBe("0");
    expect(screen.getByTestId("completed").textContent).toBe("false");
  });

  it("renders one span per character with the first marked active", () => {
    render(<TestHarness roomParagraph="hi" />);

    expect(chars()).toHaveLength(2);
    expect(chars()[0].classList.contains("active")).toBe(true);
    expect(chars()[1].classList.contains("active")).toBe(false);
  });

  // ── Correct typing ─────────────────────────────────────────────────

  it("marks a correctly typed character as correct", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("h");

    expect(chars()[0].classList.contains("correct")).toBe(true);
    expect(chars()[0].classList.contains("active")).toBe(false);
    expect(chars()[1].classList.contains("active")).toBe(true);
  });

  it("completes when all characters are typed without mistakes", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("h");
    typeChar("i");

    expect(screen.getByTestId("completed").textContent).toBe("true");
  });

  // ── Mistakes ────────────────────────────────────────────────────────

  it("marks a wrong character and increments mistakes", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("x");

    expect(chars()[0].classList.contains("wrong")).toBe(true);
    expect(screen.getByTestId("mistakes").textContent).toBe("1");
  });

  it("does not complete when the last character is wrong", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("h");
    typeChar("x"); // wrong 'i'

    expect(screen.getByTestId("completed").textContent).toBe("false");
  });

  it("accumulates total mistakes across multiple errors", () => {
    render(<TestHarness roomParagraph="abc" />);

    typeChar("x"); // mistake 1
    pressBackspace();
    typeChar("y"); // mistake 2
    pressBackspace();
    typeChar("a"); // correct

    expect(screen.getByTestId("mistakes").textContent).toBe("2");
  });

  // ── Backspace ───────────────────────────────────────────────────────

  it("allows backspace after a mistake", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("x"); // wrong
    pressBackspace();

    expect(chars()[0].classList.contains("wrong")).toBe(false);
    expect(chars()[0].classList.contains("active")).toBe(true);
  });

  it("does not allow backspace when there are no active mistakes", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("h"); // correct — mistakes stays 0
    pressBackspace();

    // Should still be at position 1
    expect(chars()[0].classList.contains("correct")).toBe(true);
    expect(chars()[1].classList.contains("active")).toBe(true);
  });

  // ── Accuracy ────────────────────────────────────────────────────────

  it("calculates accuracy as length / (length + totalMistakes) * 100", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("x"); // 1 mistake on a 2-char paragraph
    // accuracy = 2 / (2 + 1) * 100 = 66.67
    expect(screen.getByTestId("accuracy").textContent).toBe("66.67");
  });

  it("reports 100% accuracy with no mistakes", () => {
    render(<TestHarness roomParagraph="hi" />);

    typeChar("h");
    // accuracy = 2 / (2 + 0) * 100 = 100
    expect(screen.getByTestId("accuracy").textContent).toBe("100");
  });

  // ── Timer ───────────────────────────────────────────────────────────

  it("counts down each second", () => {
    render(<TestHarness roomParagraph="hello" />);

    expect(screen.getByTestId("time-left").textContent).toBe("60");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId("time-left").textContent).toBe("59");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId("time-left").textContent).toBe("58");
  });

  it("does not tick when input is disabled", () => {
    render(<TestHarness roomParagraph="hello" isInputDisabled />);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByTestId("time-left").textContent).toBe("60");
  });

  // ── Reset on paragraph change ───────────────────────────────────────

  it("resets all state when the paragraph changes (keyed remount)", () => {
    // The real app uses <TypingGame key={roomId} /> to force a full remount
    // when switching rooms, so we mirror that here.
    function Keyed({ paragraph }: { paragraph: string }) {
      return <TestHarness key={paragraph} roomParagraph={paragraph} />;
    }

    const { rerender } = render(<Keyed paragraph="hi" />);

    typeChar("h");

    rerender(<Keyed paragraph="bye" />);

    expect(screen.getByTestId("time-left").textContent).toBe("60");
    expect(screen.getByTestId("wpm").textContent).toBe("0");
    expect(screen.getByTestId("completed").textContent).toBe("false");
    expect(chars()).toHaveLength(3);
    expect(chars()[0].classList.contains("active")).toBe(true);
  });

  // ── Socket broadcast ───────────────────────────────────────────────

  it("broadcasts typing state at regular intervals", () => {
    render(<TestHarness roomParagraph="hello" />);
    sendSharedData.mockClear();

    act(() => { vi.advanceTimersByTime(100); });
    expect(sendSharedData).toHaveBeenCalled();
  });

  it("sends a reset snapshot when the paragraph loads", () => {
    render(<TestHarness roomParagraph="hello" />);

    // The very first call should be a reset with charIndex 0
    const firstCall = sendSharedData.mock.calls[0][0] as TypeObject;
    expect(firstCall.charIndex).toBe(0);
    expect(firstCall.isCompleted).toBe(false);
    expect(firstCall.WPM).toBe(0);
  });
});
