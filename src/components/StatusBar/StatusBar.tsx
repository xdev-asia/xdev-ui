import type { JSX, ReactNode } from "react";

export interface StatusBarProps {
  /** Left to right; the string "spacer" pushes the rest right. */
  items: (ReactNode | "spacer")[];
  /** Renders nothing, so the shell can hide the bar without unmounting the parent. */
  hidden?: boolean;
}

export function StatusBar({ items, hidden }: StatusBarProps): JSX.Element | null {
  if (hidden) return null;
  return (
    <footer className="ws-footer">
      {items.map((it, i) =>
        it === "spacer" ? (
          <span key={i} className="ws-footer-spacer" />
        ) : (
          <span key={i} className="ws-footer-item">
            {it}
          </span>
        ),
      )}
    </footer>
  );
}
