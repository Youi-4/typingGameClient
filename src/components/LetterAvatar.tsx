import type { CSSProperties } from "react";

const PALETTE = [
  "#1a73e8", "#e91e63", "#009688", "#ff5722", "#9c27b0",
  "#2196f3", "#ff9800", "#4caf50", "#795548", "#3f51b5",
  "#00bcd4", "#f44336", "#8bc34a", "#ff5252", "#651fff",
];

function colorFromUsername(username: string): string {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (h << 5) - h + username.charCodeAt(i);
    h |= 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}

interface LetterAvatarProps {
  username: string;
  avatarColor?: string | null;
  size?: number;
  style?: CSSProperties;
}

export function LetterAvatar({ username, avatarColor, size = 36, style }: LetterAvatarProps) {
  const bg = avatarColor || colorFromUsername(username);
  const letter = (username || "?").charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize,
        userSelect: "none",
        flexShrink: 0,
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1,
        ...style,
      }}
    >
      {letter}
    </div>
  );
}
