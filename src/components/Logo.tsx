type LogoProps = {
  className?: string;
  /** compact: mark + name only (workspace/mobile). full: adds "by Amanda Rae". */
  variant?: "full" | "compact";
  /** inverse: light lettering for dark backgrounds */
  inverse?: boolean;
};

export const LogoMark = ({ className = "", inverse = false }: { className?: string; inverse?: boolean }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    {/* loose scribble resolving into a clean content card */}
    <path
      d="M4 33c2.5-9 6.5-15.5 9-11.5S10 34 13.5 31.5s5-13.5 8.5-10-2.5 11.5 1 9"
      stroke={inverse ? "oklch(var(--background))" : "oklch(var(--foreground))"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="25"
      y="13"
      width="18"
      height="22"
      rx="3"
      fill="oklch(var(--secondary))"
      stroke={inverse ? "oklch(var(--background))" : "oklch(var(--foreground))"}
      strokeWidth="2.5"
    />
    {/* card interior stays dark — the card fill is pale cyan even on dark pages */}
    <line x1="29" y1="20" x2="39" y2="20" stroke="oklch(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <line x1="29" y1="25.5" x2="36" y2="25.5" stroke="oklch(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <circle cx="38.5" cy="30" r="2" fill="oklch(var(--highlight))" stroke="oklch(var(--foreground))" strokeWidth="1.5" />
  </svg>
);

const Logo = ({ className = "", variant = "full", inverse = false }: LogoProps) => {
  const textColor = inverse ? "text-background" : "text-foreground";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Chaos to Content by Amanda Rae">
      <LogoMark inverse={inverse} className="h-8 w-8 flex-shrink-0" />
      <span className="inline-flex flex-col leading-none">
        <span className={`font-display font-bold text-[17px] tracking-tight whitespace-nowrap ${textColor}`}>
          Chaos to Content
        </span>
        {variant === "full" && (
          <span className={`font-body text-[11px] mt-1 whitespace-nowrap ${inverse ? "text-background/70" : "text-muted-foreground"}`}>
            by Amanda Rae
          </span>
        )}
      </span>
    </span>
  );
};

export default Logo;
