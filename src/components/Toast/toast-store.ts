/** Toast queue: a tiny module-level store read with useSyncExternalStore. The reducer and helpers are pure. */
import type { ReactNode } from "react";

export type ToastTone = "ok" | "warn" | "danger" | "info";

export interface ToastOptions {
  /** Default "info". "danger" is announced with role="alert". */
  tone?: ToastTone;
  /** A second, quieter line. */
  description?: ReactNode;
  /** At most one action, usually Undo. Clicking it also dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds on screen. Default 5000, 8000 for danger; Infinity or 0 keeps it until dismissed. */
  duration?: number;
  /** Reuse an id to update a toast in place ("Uploading..." then "Uploaded"). */
  id?: string;
}

export interface ToastItem extends Omit<ToastOptions, "id" | "tone"> {
  id: string;
  message: ReactNode;
  tone: ToastTone;
}

export type ToastAction = { type: "add"; toast: ToastItem } | { type: "dismiss"; id?: string };

export function toastReducer(state: readonly ToastItem[], action: ToastAction): ToastItem[] {
  if (action.type === "add") {
    const at = state.findIndex((t) => t.id === action.toast.id);
    if (at === -1) return [...state, action.toast];
    const next = [...state];
    next[at] = action.toast;
    return next;
  }
  if (action.id == null) return state.length ? [] : (state as ToastItem[]);
  return state.some((t) => t.id === action.id) ? state.filter((t) => t.id !== action.id) : (state as ToastItem[]);
}

/** The toasts on screen: the oldest `max`. The rest wait until one is dismissed. */
export function visibleToasts(state: readonly ToastItem[], max: number): ToastItem[] {
  return state.slice(0, Math.max(0, max));
}

/** How long a toast stays, in ms, or null when it stays until dismissed. */
export function toastDuration(t: Pick<ToastItem, "tone" | "duration">): number | null {
  const ms = t.duration ?? (t.tone === "danger" ? 8000 : 5000);
  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

const EMPTY: ToastItem[] = [];
let state: ToastItem[] = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

function dispatch(action: ToastAction): void {
  const next = toastReducer(state, action);
  if (next === state) return;
  state = next;
  for (const l of listeners) l();
}

/** The store behind `toast()`, for `useSyncExternalStore`. */
export const toastStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  getSnapshot: (): ToastItem[] => state,
  getServerSnapshot: (): ToastItem[] => EMPTY,
};

/** Queues a toast and returns its id. Render the queue once with `<Toaster />`. */
export const toast = Object.assign(
  (message: ReactNode, { id, tone = "info", ...rest }: ToastOptions = {}): string => {
    const key = id ?? `x-toast-${++seq}`;
    dispatch({ type: "add", toast: { id: key, message, tone, ...rest } });
    return key;
  },
  {
    /** Removes one toast, or every toast without an id. */
    dismiss(id?: string): void {
      dispatch({ type: "dismiss", id });
    },
  },
);
