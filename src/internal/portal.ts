import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = (): (() => void) => () => {};

/**
 * Returns a function that renders a node into `document.body` when `enabled`, or in place otherwise.
 * SSR safe: on the server and during hydration it renders in place; it portals once mounted on the client.
 * `.active` tells whether the node is portalled, for effects that must re-run when it moves.
 */
export function usePortal(enabled: boolean): ((node: ReactNode) => ReactNode) & { active: boolean } {
  const client = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const active = enabled && client && typeof document !== "undefined" && document.body != null;
  const render = (node: ReactNode): ReactNode => (active ? createPortal(node, document.body) : node);
  return Object.assign(render, { active });
}
