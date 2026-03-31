import { createContext } from "react";

export interface TypeObject {
  totalMistakes: number;
  WPM: number;
  charIndex: number;
  charIndexBeforeMistake: number;
  mistakes: number;
  isActivelyTyping: boolean;
  isCompleted: boolean;
}

export interface SharedMessage {
  senderId: string;
  senderName: string;
  characterNumber: number;
  message: string;
  typeObject: TypeObject;
}

export interface RoomState {
  roomId: string;
  paragraph: string;
  characterNumber: number;
}

export interface RoomStatus {
  status: string;
}

export interface SharedSpaceContextType {
  sharedData: SharedMessage[];
  sendSharedData: (typeObject: TypeObject) => void;
  connected: boolean;
  roomId: string;
  setRoomId: (roomId: string) => void;
  roomParagraph: string;
  roomStatus: string;
  namespace: string;
  setNamespace: (ns: string) => void;
  characterNumber: number;
  setRoomSize: (roomSize: number) => void;
  roomSize: number;
  myUser: string;
  guest: boolean;
}

export const SharedSpaceContext = createContext<SharedSpaceContextType | undefined>(
  undefined
);
