import { Children, createContext, isValidElement, type JSX, type ReactNode } from "react";

/** True inside a live region that announces its toasts, so a `Toast` there drops its own role. */
export const ToastRegionContext = createContext(false);

/**
 * The two live regions toasts render into. Both are mounted before the first toast, as a live region
 * must exist before its text changes; danger toasts go to the assertive one, the rest to the polite one.
 * A plain function, not a component, so the regions sit in the caller's own element tree.
 */
export function toastRegions({ urgent, rest }: { urgent: ReactNode; rest: ReactNode }): JSX.Element {
  return (
    <ToastRegionContext.Provider value={true}>
      <div className="x-toast-live" aria-live="assertive">
        {urgent}
      </div>
      <div className="x-toast-live" aria-live="polite">
        {rest}
      </div>
    </ToastRegionContext.Provider>
  );
}

/** Splits slot children into danger toasts (an element with `tone="danger"`) and the rest. */
export function splitUrgent(nodes: ReactNode): { urgent: ReactNode[]; rest: ReactNode[] } {
  const urgent: ReactNode[] = [];
  const rest: ReactNode[] = [];
  for (const n of Children.toArray(nodes)) (isValidElement<{ tone?: unknown }>(n) && n.props.tone === "danger" ? urgent : rest).push(n);
  return { urgent, rest };
}
