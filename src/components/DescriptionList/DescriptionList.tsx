import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface DescriptionItem {
  term: ReactNode;
  value: ReactNode;
  /** Set the value in the mono face (ids, emails, paths). */
  mono?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** "rows": term left, value right (stacks below 480px). "columns": term over value in an auto-fit grid. Default "rows". */
  layout?: "rows" | "columns";
  className?: string;
}

export function DescriptionList({ items, layout = "rows", className }: DescriptionListProps): JSX.Element {
  return (
    <dl className={cx("x-dl", className)} data-layout={layout}>
      {items.map((it, i) => (
        <div className="x-dl-item" key={i}>
          <dt className="x-dl-term">{it.term}</dt>
          <dd className={cx("x-dl-value", it.mono && "ws-mono")}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
