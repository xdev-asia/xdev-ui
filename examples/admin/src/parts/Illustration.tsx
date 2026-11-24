import type { JSX } from "react";

export type Scene = "forbidden" | "not-found" | "server-error" | "unknown";

const TONE: Record<Scene, "warn" | "accent" | "danger"> = { forbidden: "warn", "not-found": "accent", "server-error": "danger", unknown: "accent" };

/** The object beside the person: a locked door, a magnifier, a server rack or a box with a question mark. */
function SceneProp({ scene }: { scene: Scene }): JSX.Element {
  if (scene === "forbidden")
    return (
      <g>
        <rect className="ill-object" x="130" y="82" width="42" height="92" rx="4" />
        <rect className="ill-object-in" x="137" y="90" width="28" height="34" rx="2" />
        <rect className="ill-object-in" x="137" y="130" width="28" height="36" rx="2" />
        <circle className="ill-line-fill" cx="164" cy="128" r="2.5" />
      </g>
    );
  if (scene === "not-found")
    return (
      <g>
        <path className="ill-object" d="M128 140 h44 v34 h-44 z" />
        <path className="ill-object-in" d="M128 140 l10 -12 h44 l-10 12 z" />
        <circle className="ill-glass" cx="160" cy="112" r="14" />
        <path className="ill-line" d="M170 122 l10 10" strokeWidth="5" strokeLinecap="round" />
      </g>
    );
  if (scene === "server-error")
    return (
      <g>
        <rect className="ill-object" x="130" y="92" width="44" height="82" rx="4" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect className="ill-object-in" x="136" y={100 + i * 24} width="32" height="16" rx="2" />
            <circle className={i === 1 ? "ill-led-bad" : "ill-led"} cx="162" cy={108 + i * 24} r="2.5" />
            <path className="ill-line" d={`M141 ${108 + i * 24} h12`} strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  return (
    <g>
      <rect className="ill-object" x="130" y="124" width="44" height="50" rx="4" />
      <path className="ill-object-in" d="M130 136 h44" />
      <text className="ill-mark" x="152" y="164" textAnchor="middle" fontSize="28">
        ?
      </text>
    </g>
  );
}

/** Badge symbol: a lock for 403, "?" for 404 and unknown, "!" for 500. */
function BadgeGlyph({ scene }: { scene: Scene }): JSX.Element {
  return (
    <g>
      <circle className="ill-badge" cx="158" cy="44" r="17" />
      {scene === "forbidden" ? (
        <g>
          <path className="ill-badge-stroke" d="M152 43 v-5 a6 6 0 0 1 12 0 v5" fill="none" strokeWidth="3" />
          <rect className="ill-badge-fill" x="149" y="42" width="18" height="12" rx="2" />
        </g>
      ) : (
        <text className="ill-badge-text" x="158" y="51" textAnchor="middle" fontSize="20">
          {scene === "server-error" ? "!" : "?"}
        </text>
      )}
    </g>
  );
}

/**
 * Flat illustrations for whole-page states, in the spirit of react-antd-admin's: a person scratching their head beside
 * the object of the error, a plant, a soft disc and a badge. Every colour is a theme token, so light and dark both work.
 * Decorative: the page's title and hint say what happened.
 */
export function Illustration({ scene }: { scene: Scene }): JSX.Element {
  return (
    <svg className="ill" data-tone={TONE[scene]} viewBox="0 0 200 190" width="220" height="209" aria-hidden="true" focusable="false">
      <circle className="ill-bg" cx="100" cy="100" r="80" />
      <circle className="ill-dot" cx="34" cy="64" r="3" />
      <circle className="ill-dot" cx="176" cy="92" r="2" />
      <path className="ill-line" d="M40 46 h16 M48 38 v16" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <ellipse className="ill-ground" cx="100" cy="176" rx="82" ry="6" />
      {/* Plant */}
      <path className="ill-leaf" d="M50 150 c-14 -10 -14 -30 -2 -42 c4 14 6 28 2 42 z" />
      <path className="ill-leaf ill-leaf-dark" d="M52 150 c12 -12 22 -16 26 -34 c-14 4 -24 16 -26 34 z" />
      <path className="ill-pot" d="M40 150 h24 l-3 26 h-18 z" />
      <SceneProp scene={scene} />
      {/* Person: legs, shoes, body, arms, head, hair */}
      <rect className="ill-pants" x="88" y="126" width="10" height="46" rx="4" />
      <rect className="ill-pants" x="102" y="126" width="10" height="46" rx="4" />
      <ellipse className="ill-shoe" cx="92" cy="173" rx="8" ry="3.5" />
      <ellipse className="ill-shoe" cx="108" cy="173" rx="8" ry="3.5" />
      <rect className="ill-shirt" x="82" y="86" width="36" height="46" rx="11" />
      <path className="ill-skin-stroke" d="M86 96 L74 84 L88 68" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path className="ill-skin-stroke" d="M115 96 L121 118" fill="none" strokeWidth="7" strokeLinecap="round" />
      <rect className="ill-skin" x="95" y="78" width="10" height="10" rx="3" />
      <circle className="ill-skin" cx="100" cy="68" r="13" />
      <path className="ill-hair" d="M87 66 a13 13 0 0 1 26 -2 c-6 -4 -14 -6 -20 -2 c-2 1 -4 3 -6 4 z" />
      <circle className="ill-eye" cx="105" cy="69" r="1.6" />
      <BadgeGlyph scene={scene} />
    </svg>
  );
}
