import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import PracticeGame from "./PracticeGame";

vi.mock("./context/useAuthContext", () => ({
  useAuthContext: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

function getInput() {
  return document.getElementById("game-input-field") as HTMLInputElement;
}

function typeText(text: string) {
  for (const char of text) {
    fireEvent.change(getInput(), { target: { value: char } });
  }
}

function getParagraphText() {
  return (document.getElementById("paragraph") as HTMLElement).innerText;
}

// ── Rendering ────────────────────────────────────────────────────────────────

describe("PracticeGame — rendering", () => {
  it("renders the paragraph text immediately with no waiting screen", () => {
    render(<PracticeGame />);
    expect(document.getElementById("paragraph")).not.toBeNull();
  });

  it("renders the hidden typing input", () => {
    render(<PracticeGame />);
    expect(getInput()).not.toBeNull();
  });

  it("renders the race track with one player row", () => {
    render(<PracticeGame />);
    expect(document.getElementsByClassName("play-panel")).toHaveLength(1);
  });

  it("shows the time label as 'Time:' not 'Time Left:'", () => {
    render(<PracticeGame />);
    const timeLabel = Array.from(document.querySelectorAll(".time p"))
      .find((el) => el.textContent?.includes("Time"));
    expect(timeLabel?.textContent).toBe("Time:");
  });

  it("starts with elapsed time at 0", () => {
    render(<PracticeGame />);
    const timeValue = document.querySelector(".time b");
    expect(timeValue?.textContent).toBe("0");
  });

  it("does not show the Play Again button before finishing", () => {
    render(<PracticeGame />);
    expect(screen.queryByRole("button", { name: "Play Again" })).toBeNull();
  });

  it("does not show the character image once the player finishes", () => {
    render(<PracticeGame />);
    const paragraph = getParagraphText();
    typeText(paragraph);
    // after completion, hideCharacterOnComplete should remove the img
    expect(document.querySelector(".character-img")).toBeNull();
    expect(document.querySelector(".rank-img")).toBeNull();
  });
});

// ── Typing and completion ────────────────────────────────────────────────────

describe("PracticeGame — typing", () => {
  it("input is enabled immediately (no countdown)", () => {
    render(<PracticeGame />);
    expect(getInput().disabled).toBe(false);
  });

  it("accepts input and marks characters correct", () => {
    render(<PracticeGame />);
    const firstChar = getParagraphText()[0];
    fireEvent.change(getInput(), { target: { value: firstChar } });
    const chars = document.getElementsByClassName("char");
    expect(chars[0].classList.contains("correct")).toBe(true);
  });

  it("shows Play Again after completing the full paragraph", () => {
    render(<PracticeGame />);
    typeText(getParagraphText());
    expect(screen.getByRole("button", { name: "Play Again" })).not.toBeNull();
  });

  it("shows the WPM graph after completing the paragraph", () => {
    render(<PracticeGame />);
    // Advance timer so elapsed > 0 before finishing
    act(() => { vi.advanceTimersByTime(5000); });
    typeText(getParagraphText());
    expect(document.querySelector(".wpm-modal")).not.toBeNull();
  });
});

// ── Play Again ───────────────────────────────────────────────────────────────

describe("PracticeGame — play again", () => {
  it("resets the paragraph after clicking Play Again", () => {
    render(<PracticeGame />);
    const firstParagraph = getParagraphText();

    typeText(firstParagraph);
    fireEvent.click(screen.getByRole("button", { name: "Play Again" }));

    // A new paragraph is rendered — the old char states are gone
    const chars = document.getElementsByClassName("char");
    const anyCorrect = Array.from(chars).some((c) => c.classList.contains("correct"));
    expect(anyCorrect).toBe(false);
  });

  it("hides Play Again after clicking it", () => {
    render(<PracticeGame />);
    typeText(getParagraphText());
    fireEvent.click(screen.getByRole("button", { name: "Play Again" }));
    expect(screen.queryByRole("button", { name: "Play Again" })).toBeNull();
  });

  it("resets the elapsed timer to 0 after play again", () => {
    render(<PracticeGame />);
    act(() => { vi.advanceTimersByTime(10_000); });
    typeText(getParagraphText());
    fireEvent.click(screen.getByRole("button", { name: "Play Again" }));
    const timeValue = document.querySelector(".time b");
    expect(timeValue?.textContent).toBe("0");
  });
});

// ── Timer ────────────────────────────────────────────────────────────────────

describe("PracticeGame — timer counts up", () => {
  it("elapsed time increases while typing", () => {
    render(<PracticeGame />);
    // type a character to start the timer (matches e2e behaviour)
    fireEvent.change(getInput(), { target: { value: "a" } });
    act(() => { vi.advanceTimersByTime(3000); });
    const timeValue = document.querySelector(".time b");
    // After ~3s the elapsed counter should be >= 1
    expect(Number(timeValue?.textContent)).toBeGreaterThanOrEqual(1);
  });

  it("can type well past 60 seconds without the game ending", () => {
    render(<PracticeGame />);
    act(() => { vi.advanceTimersByTime(120_000); });
    // Play Again should NOT be visible — game isn't over just because time passed
    expect(screen.queryByRole("button", { name: "Play Again" })).toBeNull();
  });
});
