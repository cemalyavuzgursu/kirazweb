"use client";

interface MarqueeBarProps {
  text: string;
  separator?: string;
  animated?: boolean;
  speed?: number;
  background?: string;
  textColor?: string;
  textSize?: "sm" | "md";
}

const BG_MAP: Record<string, string> = {
  white: "#ffffff",
  cream: "var(--color-cream-100, #faf3ea)",
  primary: "var(--kt-primary, #c95265)",
};

const TEXT_MAP: Record<string, string> = {
  dark: "var(--kt-text, #161108)",
  light: "#ffffff",
};

export function MarqueeBar({
  text,
  separator = "✦",
  animated = true,
  speed = 20,
  background = "primary",
  textColor = "light",
  textSize = "sm",
}: MarqueeBarProps) {
  if (!text) return null;

  const bg = BG_MAP[background] ?? background;
  const color = TEXT_MAP[textColor] ?? textColor;
  const sizeClass = textSize === "md" ? "text-sm" : "text-xs";
  const item = `${text}   ${separator}   `;

  return (
    <div className={`overflow-hidden py-2.5 font-medium ${sizeClass}`} style={{ backgroundColor: bg, color }}>
      {animated ? (
        <div
          className="flex whitespace-nowrap"
          style={{ animation: `kt-marquee ${speed}s linear infinite` }}
          aria-label={text}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="shrink-0" aria-hidden={i > 0}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-center">{text}</p>
      )}
    </div>
  );
}
