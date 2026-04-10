import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRoomLifecycle } from "./useRoomLifecycle";

function defaultProps(overrides: Partial<Parameters<typeof useRoomLifecycle>[0]> = {}) {
  return {
    roomId: "room-1",
    roomSize: 2 as number | null,
    roomStatus: "",
    scheduleLeaveRoom: vi.fn(),
    cancelScheduledLeaveRoom: vi.fn(),
    ...overrides,
  };
}

describe("useRoomLifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with input disabled", () => {
    const { result } = renderHook(() => useRoomLifecycle(defaultProps()));
    expect(result.current.isInputDisabled).toBe(true);
  });

  it("shows waiting message for multi-player rooms", () => {
    const { result } = renderHook(() => useRoomLifecycle(defaultProps()));
    expect(result.current.countdownMessage).toBe("Waiting for Players to join");
  });

  it("animates waiting dots while waiting for players", () => {
    const { result } = renderHook(() => useRoomLifecycle(defaultProps()));

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Waiting for Players to join.");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Waiting for Players to join..");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Waiting for Players to join...");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Waiting for Players to join");
  });

  it("skips waiting message for single-player rooms", () => {
    const { result } = renderHook(() =>
      useRoomLifecycle(defaultProps({ roomSize: 1 }))
    );
    expect(result.current.countdownMessage).toBe("");
  });

  it("runs the full countdown after room is filled", () => {
    const { result } = renderHook(() =>
      useRoomLifecycle(defaultProps({ roomStatus: "filled" }))
    );

    // Step 0: initial frame shown immediately
    expect(result.current.countdownMessage).toBe("Waiting for Players to join");

    // Step 1: "The Race begins in" (after 1 s)
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("The Race begins in");

    // Step 2: "3" (step 1 uses a 2 s delay)
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.countdownMessage).toBe("3");

    // Step 3: "2"
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("2");

    // Step 4: "1"
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("1");

    // Step 5: "Go!"
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Go!");

    // Countdown finished — input enabled
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBeNull();
    expect(result.current.isInputDisabled).toBe(false);
  });

  it("enables input for single-player after countdown", () => {
    const { result } = renderHook(() =>
      useRoomLifecycle(defaultProps({ roomSize: 1, roomStatus: "filled" }))
    );

    // Single-player frames: ["", "The Race begins in", "3", "2", "1", "Go!"]
    // Step 0 → 1 (1 s)
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("The Race begins in");

    // Step 1 → 2 (2 s)
    act(() => { vi.advanceTimersByTime(2000); });
    // Step 2 → 3, 3 → 4, 4 → 5 (1 s each)
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdownMessage).toBe("Go!");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isInputDisabled).toBe(false);
  });

  it("calls cancelScheduledLeaveRoom on mount and scheduleLeaveRoom on unmount", () => {
    const scheduleLeaveRoom = vi.fn();
    const cancelScheduledLeaveRoom = vi.fn();

    const { unmount } = renderHook(() =>
      useRoomLifecycle(
        defaultProps({ scheduleLeaveRoom, cancelScheduledLeaveRoom })
      )
    );

    expect(cancelScheduledLeaveRoom).toHaveBeenCalledWith("room-1");

    unmount();
    expect(scheduleLeaveRoom).toHaveBeenCalledWith("room-1");
  });
});
