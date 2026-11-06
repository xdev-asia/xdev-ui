import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type JSX } from "react";
import { Toast } from "./Toast";
import { toast, toastDuration, toastStore, visibleToasts } from "./toast-store";

export interface ToasterLabels {
  /** aria-label of the toast region. */
  region: string;
  dismiss: string;
}

const DEFAULT_LABELS: ToasterLabels = { region: "Notifications", dismiss: "Dismiss" };

export interface ToasterProps {
  /** Corner of the viewport. Default "bottom-end". */
  position?: "bottom-end" | "bottom-start" | "bottom-center" | "top-end" | "top-start" | "top-center";
  /** Toasts on screen at once; the rest wait. Default 3. */
  max?: number;
  labels?: Partial<ToasterLabels>;
}

interface Timer {
  remaining: number;
  started: number;
  handle?: ReturnType<typeof setTimeout>;
}

/** Renders the `toast()` queue. Mount it once, near the root. Timers pause while the pointer or focus is on a toast. */
export function Toaster({ position = "bottom-end", max = 3, labels }: ToasterProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const all = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
  const shown = visibleToasts(all, max);
  const [paused, setPaused] = useState(false);
  const timers = useRef(new Map<string, Timer>());
  const shownKey = shown.map((t) => `${t.id}:${String(t.duration)}:${t.tone}`).join("|");

  useEffect(() => {
    const map = timers.current;
    const ids = new Set(shown.map((t) => t.id));
    for (const id of map.keys()) if (!ids.has(id)) map.delete(id);
    for (const t of shown) {
      const ms = toastDuration(t);
      if (ms == null) continue;
      let timer = map.get(t.id);
      if (!timer) map.set(t.id, (timer = { remaining: ms, started: 0 }));
      if (paused) continue;
      timer.started = Date.now();
      timer.handle = setTimeout(() => toast.dismiss(t.id), timer.remaining);
    }
    return () => {
      const now = Date.now();
      for (const timer of map.values()) {
        if (timer.handle === undefined) continue;
        clearTimeout(timer.handle);
        timer.handle = undefined;
        timer.remaining = Math.max(0, timer.remaining - (now - timer.started));
      }
    };
  }, [shownKey, paused]); // eslint-disable-line react-hooks/exhaustive-deps -- shownKey stands for shown

  return (
    <section
      className="x-toaster ws-toasts"
      aria-label={l.region}
      data-position={position}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {shown.map((t) => (
        <Toast
          key={t.id}
          tone={t.tone}
          description={t.description}
          actionLabel={t.action?.label}
          onAction={
            t.action
              ? () => {
                  t.action?.onClick();
                  toast.dismiss(t.id);
                }
              : undefined
          }
          onDismiss={() => toast.dismiss(t.id)}
          labels={{ dismiss: l.dismiss }}
        >
          {t.message}
        </Toast>
      ))}
    </section>
  );
}
