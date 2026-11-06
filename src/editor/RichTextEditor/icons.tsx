import type { JSX } from "react";

/**
 * Formatting glyphs drawn here, not added to the core icon set: only the editor needs them.
 * Same grid and stroke as `Icon` (24 viewBox, stroke 1.75, round caps, no fills).
 */
const PATHS = {
  heading2: "M4 6v12M12 6v12M4 12h8M16 10.5a2.5 2.5 0 0 1 5 0c0 1.5-1.2 2.4-2.5 3.6L16 18h5",
  heading3: "M4 6v12M12 6v12M4 12h8M16 8h5l-3 4a3 3 0 1 1-2.6 4.5",
  bold: "M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z",
  italic: "M10 5h8M6 19h8M14 5l-4 14",
  bulletList: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  orderedList: "M10 6h10M10 12h10M10 18h10M4 4.5l1.5-.5V9M3.5 14.5a1.5 1.5 0 0 1 3 .3c0 .9-3 2.2-3 3.7h3",
  quote: "M5 17c2 0 3.5-1.5 3.5-3.5V8H4v5.5h4.5M15.5 17c2 0 3.5-1.5 3.5-3.5V8h-4.5v5.5H19",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  image: "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM21 16l-5-5-9 9M9 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  redo: "m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13",
} as const;

export type ToolIcon = keyof typeof PATHS;

export function ToolGlyph({ name }: { name: ToolIcon }): JSX.Element {
  return (
    <svg className="x-icon" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
