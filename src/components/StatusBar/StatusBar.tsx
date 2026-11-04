import type { JSX, ReactNode } from "react";

export interface StatusBarProps {
  /** Left to right; the string "spacer" pushes the rest right. */
  items: (ReactNode | "spacer")[];
}

export function StatusBar({ items }: StatusBarProps): JSX.Element {
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
