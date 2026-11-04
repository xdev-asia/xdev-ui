import type { ReactElement, ReactNode } from "react";

type AnyEl = ReactElement<Record<string, any>>;

/** Walks an unrendered element tree (children only) and returns elements matching `pred`. */
export function findAll(node: ReactNode, pred: (el: AnyEl) => boolean): AnyEl[] {
  const out: AnyEl[] = [];
  const walk = (n: ReactNode): void => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === "object" && "props" in n) {
      const el = n as AnyEl;
      if (pred(el)) out.push(el);
      walk(el.props.children);
    }
  };
  walk(node);
  return out;
}
