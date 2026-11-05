import { useCallback, useEffect, useState } from "react";

/** What a page renders: one of three states. */
export type Load<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/** Runs `load` on mount and whenever `deps` change; `reload()` runs it again. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): { state: Load<T>; reload: () => void; set: (data: T) => void } {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    load().then(
      (data) => live && setState({ status: "ready", data }),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  const set = useCallback((data: T) => setState({ status: "ready", data }), []);
  return { state, reload, set };
}
