interface CountdownBannerProps {
  message: string | null;
}

export function CountdownBanner({ message }: CountdownBannerProps) {
  if (!message) {
    return null;
  }

  const isWaiting = message.startsWith("Waiting");
  const animationKey = isWaiting ? "waiting" : message;

  return (
    <div>
      <h2 key={animationKey} className="animate">{message}</h2>
    </div>
  );
}
