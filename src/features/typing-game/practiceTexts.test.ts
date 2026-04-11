import { describe, it, expect } from "vitest";
import { getRandomPracticeText } from "./practiceTexts";

describe("getRandomPracticeText", () => {
  it("returns a non-empty string", () => {
    const text = getRandomPracticeText();
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("never returns the excluded string", () => {
    const first = getRandomPracticeText();
    for (let i = 0; i < 50; i++) {
      expect(getRandomPracticeText(first)).not.toBe(first);
    }
  });

  it("still returns a non-empty string when exclude is provided", () => {
    const first = getRandomPracticeText();
    const second = getRandomPracticeText(first);
    expect(typeof second).toBe("string");
    expect(second.length).toBeGreaterThan(0);
  });

  it("returns different texts across multiple calls when no exclude is given", () => {
    const results = new Set(Array.from({ length: 30 }, () => getRandomPracticeText()));
    // With 15 texts, 30 calls should produce at least 2 distinct results
    expect(results.size).toBeGreaterThan(1);
  });
});
