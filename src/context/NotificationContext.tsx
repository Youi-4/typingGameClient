import { createContext } from "react";

export interface IncomingChallenge {
  fromUsername: string;
  roomId: string;
}

export interface NotificationContextType {
  /** Challenge invite waiting for this user to respond to */
  incomingChallenge: IncomingChallenge | null;
  /** Username of the user we challenged (waiting for their response) */
  pendingChallengeTarget: string | null;
  /** Send a challenge to another user */
  sendChallenge: (targetUsername: string, roomId: string) => void;
  /** Accept or decline an incoming challenge */
  respondToChallenge: (accepted: boolean) => void;
  /** Whether the user wants to receive challenges */
  acceptsChallenges: boolean;
  setAcceptsChallenges: (value: boolean) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
