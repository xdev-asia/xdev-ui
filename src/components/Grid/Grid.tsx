import type { CSSProperties, ElementType, HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { SpaceStep } from "../Stack/Stack";
import { responsiveEntries, type Responsive } from "./breakpoints";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Column count, or one per breakpoint: `{ base: 1, md: 2, xl: 4 }`. Default 1. Ignored with `minItemWidth`. */
  columns?: Responsive<number>;
  /** Fit as many columns as there is room for, each at least this wide (any CSS length, e.g. "16rem"). */
  minItemWidth?: string;
  /** Gap between cells, a space step. Default 4 (16px). */
  gap?: SpaceStep;
  /** What the breakpoints measure: the "viewport" (default) or the grid's own width ("container"), for grids inside panels and drawers. */
  responsive?: "viewport" | "container";
  as?: ElementType;
  children?: ReactNode;
}

function vars(prefix: string, value: Responsive<number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [bp, v] of responsiveEntries(value)) {
    out[bp === "base" ? prefix : `${prefix}-${bp}`] = Math.max(1, Math.floor(v));
  }
  return out;
}

export function Grid({ columns = 1, minItemWidth, gap = 4, responsive = "viewport", as: Tag = "div", className, style, children, ...rest }: GridProps): JSX.Element {
  const custom = minItemWidth ? { "--x-grid-min": minItemWidth } : vars("--x-grid-cols", columns);
  const grid = (
    <Tag
      {...rest}
      className={cx("x-grid", className)}
      data-gap={gap}
      data-auto={minItemWidth ? "true" : undefined}
      data-scope={responsive === "container" ? "container" : undefined}
      style={{ ...custom, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
  return responsive === "container" ? <div className="x-grid-scope">{grid}</div> : grid;
}

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
  /** Columns this cell spans, or one per breakpoint. "full" spans the whole row. Default 1. */
  span?: Responsive<number> | "full";
  as?: ElementType;
  children?: ReactNode;
}

export function GridItem({ span, as: Tag = "div", className, style, children, ...rest }: GridItemProps): JSX.Element {
  const full = span === "full";
  const custom = full ? {} : vars("--x-span", span);
  return (
    <Tag {...rest} className={cx("x-grid-item", className)} data-full={full ? "true" : undefined} style={{ ...custom, ...style } as CSSProperties}>
      {children}
    </Tag>
  );
}
