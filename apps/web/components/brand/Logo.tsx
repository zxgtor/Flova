type LogoProps = {
  wordmark?: boolean;
  className?: string;
};

export function Logo({ wordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg role="img" aria-label="Flova" viewBox="0 0 32 32" className="h-7 w-7" fill="none">
        <defs>
          <linearGradient id="flova-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-bright)" />
            <stop offset="50%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-deep)" />
          </linearGradient>
        </defs>
        <path d="M4 28V6l8 10 4-5 4 5 8-10v22h-5V15l-7 9-7-9v13z" fill="url(#flova-gold)" />
      </svg>
      {wordmark && (
        <span className="font-display text-xl font-semibold text-gold-gradient">Flova</span>
      )}
    </span>
  );
}
