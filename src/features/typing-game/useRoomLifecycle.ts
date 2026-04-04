import { useEffect, useMemo, useState } from "react";

interface UseRoomLifecycleOptions {
  roomId: string;
  roomSize: number | null;
  roomStatus: string;
  scheduleLeaveRoom: (roomId?: string) => void;
  cancelScheduledLeaveRoom: (roomId?: string) => void;
}

const LOADING_DOTS = ["", ".", "..", "..."];

export function useRoomLifecycle({
  roomId,
  roomSize,
  roomStatus,
  scheduleLeaveRoom,
  cancelScheduledLeaveRoom,
}: UseRoomLifecycleOptions) {
  const [countdownStep, setCountdownStep] = useState(0);
  const [waitingStep, setWaitingStep] = useState(0);
  const [isInputDisabled, setIsInputDisabled] = useState(true);

  const countdownFrames = useMemo(
    () => (
      roomSize === 1
        ? ["", "The Race begins in", "3", "2", "1", "Go!"]
        : ["Waiting for Players to join.", "The Race begins in", "3", "2", "1", "Go!"]
    ),
    [roomSize]
  );

  useEffect(() => {
    const mountedRoomId = roomId;
    cancelScheduledLeaveRoom(mountedRoomId);

    return () => {
      scheduleLeaveRoom(mountedRoomId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- provider callbacks are ref/timer-based and must not retrigger cleanup on every render
  }, [roomId]);

  useEffect(() => {
    if (roomStatus === "filled") {
      setWaitingStep(0);
      return;
    }

    const timer = setTimeout(() => {
      setWaitingStep((current) => current + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [roomStatus, waitingStep]);

  useEffect(() => {
    if (countdownStep === countdownFrames.length) {
      setIsInputDisabled(false);
      return;
    }

    if (roomStatus !== "filled") {
      return;
    }

    const timer = setTimeout(() => {
      setCountdownStep((current) => current + 1);
    }, countdownStep === 1 ? 2000 : 1000);

    return () => clearTimeout(timer);
  }, [countdownFrames.length, countdownStep, roomStatus]);

  const countdownMessage = useMemo(() => {
    if (countdownStep >= countdownFrames.length) {
      return null;
    }

    const baseMessage = countdownFrames[countdownStep];
    if (roomSize === 1) {
      return baseMessage;
    }

    return `${baseMessage}${LOADING_DOTS[waitingStep % LOADING_DOTS.length]}`;
  }, [countdownFrames, countdownStep, roomSize, waitingStep]);

  return {
    countdownMessage,
    isInputDisabled,
  };
}
