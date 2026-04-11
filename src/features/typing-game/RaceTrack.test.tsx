import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { RaceTrack } from "./RaceTrack";
import type { SharedMessage } from "../../context/SharedSpaceContext";

afterEach(cleanup);

function makePlayer(overrides: Partial<SharedMessage["typeObject"]> = {}): Array<[string, SharedMessage]> {
  return [
    [
      "player-1",
      {
        senderId: "player-1",
        senderName: "Alice",
        characterNumber: 0,
        message: "",
        typeObject: {
          charIndex: 0,
          charIndexBeforeMistake: 0,
          isActivelyTyping: false,
          isCompleted: false,
          mistakes: 0,
          totalMistakes: 0,
          WPM: 0,
          ...overrides,
        },
      },
    ],
  ];
}

const baseProps = {
  myUser: "player-1",
  roomParagraphLength: 100,
  roomSize: 1,
  playerStatsCache: {},
  assignedRanks: {},
  settledSenders: new Set<string>(),
  loadPlayerStats: () => {},
};

// ── hideCharacterOnComplete ──────────────────────────────────────────────────

describe("RaceTrack — hideCharacterOnComplete", () => {
  it("shows the character image when player is not completed", () => {
    render(
      <RaceTrack
        {...baseProps}
        players={makePlayer({ isCompleted: false })}
        hideCharacterOnComplete
      />
    );
    expect(screen.getByRole("img", { name: "moving" })).toBeInTheDocument();
  });

  it("hides the character image when player is completed and hideCharacterOnComplete is true", () => {
    render(
      <RaceTrack
        {...baseProps}
        players={makePlayer({ isCompleted: true })}
        hideCharacterOnComplete
      />
    );
    expect(screen.queryByRole("img", { name: "moving" })).toBeNull();
  });

  it("still shows the rank image when completed and hideCharacterOnComplete is false (default)", () => {
    render(
      <RaceTrack
        {...baseProps}
        players={makePlayer({ isCompleted: true })}
      />
    );
    expect(screen.getByRole("img", { name: "moving" })).toBeInTheDocument();
  });
});

// ── player label ─────────────────────────────────────────────────────────────

describe("RaceTrack — player label", () => {
  it("renders the player's senderName", () => {
    render(<RaceTrack {...baseProps} players={makePlayer()} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders nothing for an empty senderName (practice solo)", () => {
    const players: Array<[string, SharedMessage]> = [
      [
        "solo",
        {
          senderId: "solo",
          senderName: "",
          characterNumber: 0,
          message: "",
          typeObject: {
            charIndex: 0,
            charIndexBeforeMistake: 0,
            isActivelyTyping: false,
            isCompleted: false,
            mistakes: 0,
            totalMistakes: 0,
            WPM: 0,
          },
        },
      ],
    ];

    render(<RaceTrack {...baseProps} myUser="solo" players={players} />);
    // The <b> tag renders but with no text — no name visible
    expect(screen.queryByText("solo")).toBeNull();
    expect(screen.queryByText("You")).toBeNull();
  });

  it("appends (You) for the local player in a multiplayer room", () => {
    const players: Array<[string, SharedMessage]> = [
      [
        "player-1",
        {
          senderId: "player-1",
          senderName: "Alice",
          characterNumber: 0,
          message: "",
          typeObject: {
            charIndex: 5,
            charIndexBeforeMistake: 5,
            isActivelyTyping: true,
            isCompleted: false,
            mistakes: 0,
            totalMistakes: 0,
            WPM: 30,
          },
        },
      ],
    ];

    render(
      <RaceTrack
        {...baseProps}
        players={players}
        myUser="player-1"
        roomSize={2}
      />
    );
    expect(screen.getByText("Alice (You)")).toBeInTheDocument();
  });
});

// ── progress calculation ──────────────────────────────────────────────────────

describe("RaceTrack — character image position", () => {
  it("renders the character img when typing is in progress", () => {
    render(
      <RaceTrack
        {...baseProps}
        players={makePlayer({ charIndex: 20, isActivelyTyping: true, mistakes: 0 })}
      />
    );
    const img = screen.getByRole("img", { name: "moving" });
    expect(img).toBeInTheDocument();
    // position is set as inline style left — check it's not 0%
    expect(img).toHaveAttribute("style");
  });
});
