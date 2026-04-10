import { useParams } from "react-router-dom";
import TypingGame from "./TypingGame";

export default function TypingGameKeyed() {
  const { roomId } = useParams();
  return <TypingGame key={roomId} />;
}
