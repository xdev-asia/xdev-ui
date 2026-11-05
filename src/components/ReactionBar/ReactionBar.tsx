import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface ReactionItem {
  /** Passed back to `onToggle`. */
  key: string;
  /** Required: the accessible name and title of the button ("Thumbs up"). */
  label: string;
  /** What the button shows: an Icon or a short text. */
  symbol: ReactNode;
  count: number;
  /** The signed-in person reacted. Rendered as aria-pressed. */
  mine: boolean;
}

export interface ReactionBarProps {
  items: ReactionItem[];
  onToggle: (key: string) => void;
  disabled?: boolean;
  /** Accessible name of the group. */
  label?: string;
  className?: string;
}

export function ReactionBar({ items, onToggle, disabled = false, label, className }: ReactionBarProps): JSX.Element {
  return (
    <div className={cx("x-reaction-bar", className)} role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="x-reaction"
          aria-pressed={item.mine}
          aria-label={item.label}
          title={item.label}
          disabled={disabled}
          onClick={() => onToggle(item.key)}
        >
          <span className="x-reaction-symbol">{item.symbol}</span>
          {item.count > 0 ? <span className="x-reaction-count">{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
