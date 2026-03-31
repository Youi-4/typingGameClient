import { useContext } from "react";
import { SharedSpaceContext } from "./SharedSpaceContext";
import type { SharedSpaceContextType } from "./SharedSpaceContext";

export function useSharedSpace(): SharedSpaceContextType {
  const context = useContext(SharedSpaceContext);
  if (!context) {
    throw new Error(
      "useSharedSpace must be used within a SharedSpaceProvider"
    );
  }
  return context;
}
