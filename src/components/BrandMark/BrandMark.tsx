import type { JSX } from "react";

/** Edge sizes the app chrome uses; any number is accepted. */
export type BrandMarkSize = 16 | 18 | 20 | 64;

export interface BrandMarkProps {
  variant?: "mark" | "tile" | "lockup";
  /** Mark or tile edge in px (default 24). Lockup wordmark = size × 25/32. */
  size?: BrandMarkSize | number;
  /** `mark`: set on the svg itself. `tile` and `lockup`: set on the wrapper. */
  className?: string;
}

/** Logo v9: a round-capped × (follows the surface colour) + the agent cursor in --brand-agent. */
function MarkSvg({ size, className }: { size: number; className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="250 225 550 550"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M316 368L580 632M580 368L316 632" stroke="currentColor" strokeWidth={112} strokeLinecap="round" fill="none" />
      <rect x={640} y={580} width={150} height={64} rx={18} style={{ fill: "var(--brand-agent)" }} />
    </svg>
  );
}

function TileSvg({ size }: { size: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect width={16} height={16} rx={3.5} fill="#2f62e6" />
      <path d="M3.6 4.6L8.4 9.4M8.4 4.6L3.6 9.4" stroke="#fff" strokeWidth={2.1} strokeLinecap="round" fill="none" />
      <rect x={9.6} y={8.7} width={3.4} height={1.6} rx={0.4} style={{ fill: "var(--brand-agent)" }} />
    </svg>
  );
}

export function BrandMark({ variant = "mark", size = 24, className }: BrandMarkProps): JSX.Element {
  if (variant === "tile") {
    return (
      <span className={["x-mark-tile", className].filter(Boolean).join(" ")} role="img" aria-label="xDev">
        <TileSvg size={size} />
      </span>
    );
  }
  if (variant === "lockup") {
    return (
      <span
        className={["x-lockup", className].filter(Boolean).join(" ")}
        role="img"
        aria-label="xDev"
        style={{ fontSize: Math.round((size * 25) / 32) }}
      >
        <TileSvg size={size} />
        <span className="x-lockup-word" aria-hidden="true">xDev</span>
        <span className="x-lockup-cursor" aria-hidden="true" />
      </span>
    );
  }
  // Bare decorative svg: the × takes `currentColor` from the surrounding CSS, `className` lands on the svg.
  return <MarkSvg size={size} className={className} />;
}
