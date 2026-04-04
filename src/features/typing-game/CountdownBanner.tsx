interface CountdownBannerProps {
  message: string | null;
}

export function CountdownBanner({ message }: CountdownBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div>
      <h2 key={message} className="animate">{message}</h2>
    </div>
  );
}
