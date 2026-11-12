import { useId, type JSX } from "react";

/** Edge sizes the app chrome uses; any number is accepted. */
export type BrandMarkSize = 16 | 18 | 20 | 64;

/**
 * The parent brand and its sub-systems. Each keeps your blade and has its own agent shape.
 * This package is public: a system is added here only once it is public too.
 */
export type BrandSystem = "xdev" | "cleaner" | "ui";

export interface BrandMarkProps {
  variant?: "mark" | "tile" | "lockup";
  /** Which system the mark stands for (default "xdev", the parent brand). */
  system?: BrandSystem;
  /** Mark or tile edge in px (default 24). Lockup wordmark = size × 25/32. A tile from 48 px up is the lit icon. */
  size?: BrandMarkSize | number;
  /** `mark`: set on the svg itself. `tile` and `lockup`: set on the wrapper. */
  className?: string;
  /** Accessible name of the `mark` (default: the system's name). Pass "" when the mark is decorative. */
  label?: string;
}

/** Wordmark parts: the bold lead and the lighter rest. */
const NAME: Record<BrandSystem, readonly [lead: string, rest: string]> = {
  xdev: ["xDev", ""],
  cleaner: ["Cleaner", "for xDev"],
  ui: ["xDev", "UI"],
};
const fullName = (system: BrandSystem): string => NAME[system].filter(Boolean).join(" ");

// Logo v12 on a 1024 grid: two folded blades that cross into an x. Yours is on the left, the agent's on the right,
// and where they overlap is the core.
const YOU = "M185 232H335L575 512L335 792H185L425 512Z";
const YOU_UPPER = "M185 232H335L575 512H425Z";
const YOU_LOWER = "M425 512H575L335 792H185Z";
const AGENT = "M839 232H689L449 512L689 792H839L599 512Z";
const AGENT_UPPER = "M839 232H689L449 512H599Z";
const AGENT_LOWER = "M599 512H449L689 792H839Z";
const CORE = "M512 438.5L575 512L512 585.5L449 512Z";
const AGENT_ORANGE = "var(--brand-agent)";
/** The lit icon is used from this edge up; below it the tile is flat. */
const LIT_FROM = 48;
/** A sub-system mark sits 20 to the left so that blade plus shape stay centred. */
const SUB_SHIFT = "translate(-20 0)";

/** What stands in for the agent blade in a sub-system mark. Shapes inherit their fill. */
function AgentShape({ system }: { system: Exclude<BrandSystem, "xdev"> }): JSX.Element {
  switch (system) {
    case "cleaner":
      return (
        <>
          <path d="M722 527V412A115 115 0 1 0 837 527Z" />
          <path d="M744 505V390A115 115 0 0 1 859 505Z" opacity={0.78} />
        </>
      );
    case "ui":
      return (
        <>
          <rect x={608} y={391} width={110} height={110} rx={28} />
          <rect x={740} y={391} width={110} height={110} rx={28} opacity={0.72} />
          <rect x={608} y={523} width={110} height={110} rx={28} opacity={0.72} />
          <rect x={740} y={523} width={110} height={110} rx={28} opacity={0.46} />
        </>
      );
  }
}
const SHAPE_FIT = "translate(735 512) scale(1.15) translate(-725 -512)";

/** The flat mark: your blade in `you`, the agent side in the brand orange, the core white. */
function FlatBlades({ system, you }: { system: BrandSystem; you: string }): JSX.Element {
  if (system === "xdev") {
    return (
      <>
        <path d={YOU} fill={you} />
        <path d={AGENT} style={{ fill: AGENT_ORANGE }} />
        <path d={CORE} fill="#fff" />
      </>
    );
  }
  return (
    <g transform={SUB_SHIFT}>
      <path d={YOU} fill={you} />
      <g transform={SHAPE_FIT} style={{ fill: AGENT_ORANGE }}>
        <AgentShape system={system} />
      </g>
    </g>
  );
}

function MarkSvg({ system, size, className, label }: { system: BrandSystem; size: number; className?: string; label: string }): JSX.Element {
  return (
    <svg
      className={["x-mark", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="162 162 700 700"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <FlatBlades system={system} you="currentColor" />
    </svg>
  );
}

/** Flat tile for small sizes: no light effects, so it stays crisp at 16 to 32 px. */
function FlatTile({ system, size }: { system: BrandSystem; size: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <rect width={1024} height={1024} rx={224} fill="#0d1220" />
      <FlatBlades system={system} you="#5b8cff" />
    </svg>
  );
}

/** The lit icon: dark ground with a blue and an orange glow, blades lit from above, a bright core. */
function LitTile({ system, size }: { system: BrandSystem; size: number }): JSX.Element {
  // Paint ids must be unique per instance; useId can hold characters a url() reference does not accept.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = (name: string): string => `url(#${id}${name})`;
  const shadow = { opacity: 0.55, filter: ref("shadow"), transform: "translate(0 22)" };
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171d33" />
          <stop offset="1" stopColor="#06080e" />
        </linearGradient>
        <radialGradient id={`${id}glowYou`} cx="330" cy="512" r="430" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f62e6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#2f62e6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}glowAgent`} cx="700" cy="512" r="400" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff7a3d" stopOpacity="0.42" />
          <stop offset="1" stopColor="#ff7a3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={`${id}youUpper`} x1="0" y1="232" x2="0" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b9cfff" />
          <stop offset="1" stopColor="#4f84ff" />
        </linearGradient>
        <linearGradient id={`${id}youLower`} x1="0" y1="512" x2="0" y2="792" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f62e6" />
          <stop offset="1" stopColor="#1a3db3" />
        </linearGradient>
        <linearGradient id={`${id}agentUpper`} x1="0" y1="232" x2="0" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffc9a3" />
          <stop offset="1" stopColor="#ff8a4f" />
        </linearGradient>
        <linearGradient id={`${id}agentLower`} x1="0" y1="512" x2="0" y2="792" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff7a3d" />
          <stop offset="1" stopColor="#d94e14" />
        </linearGradient>
        <linearGradient id={`${id}shape`} x1="0" y1="322" x2="0" y2="702" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffc9a3" />
          <stop offset="0.5" stopColor="#ff7a3d" />
          <stop offset="1" stopColor="#d94e14" />
        </linearGradient>
        <linearGradient id={`${id}core`} x1="0" y1="438" x2="0" y2="586" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#ffe2cc" />
        </linearGradient>
        <filter id={`${id}soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
        <filter id={`${id}shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id={`${id}clip`}>
          <rect width={1024} height={1024} rx={230} />
        </clipPath>
      </defs>
      <g clipPath={ref("clip")}>
        <rect width={1024} height={1024} fill={ref("base")} />
        <rect width={1024} height={1024} fill={ref("glowYou")} />
        <rect width={1024} height={1024} fill={ref("glowAgent")} />
      </g>
      <rect x={4} y={4} width={1016} height={1016} rx={226} fill="none" stroke={ref("rim")} strokeWidth={8} />
      {system === "xdev" ? (
        <>
          <g {...shadow}>
            <path d={`${YOU} ${AGENT}`} fill="#000" />
          </g>
          <path d={YOU_UPPER} fill={ref("youUpper")} />
          <path d={YOU_LOWER} fill={ref("youLower")} />
          <path d={AGENT_UPPER} fill={ref("agentUpper")} />
          <path d={AGENT_LOWER} fill={ref("agentLower")} />
          <path d={CORE} fill="#fff" filter={ref("soft")} opacity={0.95} />
          <path d={CORE} fill={ref("core")} />
        </>
      ) : (
        <g transform={SUB_SHIFT}>
          <g {...shadow} fill="#000">
            <path d={YOU} />
            <g transform={SHAPE_FIT}>
              <AgentShape system={system} />
            </g>
          </g>
          <path d={YOU_UPPER} fill={ref("youUpper")} />
          <path d={YOU_LOWER} fill={ref("youLower")} />
          <g transform={SHAPE_FIT} fill={ref("shape")}>
            <AgentShape system={system} />
          </g>
        </g>
      )}
    </svg>
  );
}

function Tile({ system, size }: { system: BrandSystem; size: number }): JSX.Element {
  return size >= LIT_FROM ? <LitTile system={system} size={size} /> : <FlatTile system={system} size={size} />;
}

export function BrandMark({ variant = "mark", system = "xdev", size = 24, className, label }: BrandMarkProps): JSX.Element {
  const name = fullName(system);
  if (variant === "tile") {
    return (
      <span className={["x-mark-tile", className].filter(Boolean).join(" ")} role="img" aria-label={name}>
        <Tile system={system} size={size} />
      </span>
    );
  }
  if (variant === "lockup") {
    const [lead, rest] = NAME[system];
    return (
      <span
        className={["x-lockup", className].filter(Boolean).join(" ")}
        role="img"
        aria-label={name}
        style={{ fontSize: Math.round((size * 25) / 32) }}
      >
        <Tile system={system} size={size} />
        <span className="x-lockup-word" aria-hidden="true">{lead}</span>
        {rest ? <span className="x-lockup-sub" aria-hidden="true">{rest}</span> : null}
      </span>
    );
  }
  // Bare svg, no wrapper: your blade takes `currentColor` (.x-mark sets --accent; a later rule may override).
  return <MarkSvg system={system} size={size} className={className} label={label ?? name} />;
}
