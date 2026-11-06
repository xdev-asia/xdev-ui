import { useCallback, useEffect, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";

export interface SaveBarLabels {
  /** The bar's message and region name. */
  unsaved: string;
  save: string;
  discard: string;
  saving: string;
}

const DEFAULT_LABELS: SaveBarLabels = { unsaved: "You have unsaved changes", save: "Save", discard: "Discard", saving: "Saving" };

export interface SaveBarProps {
  /** The form differs from what is saved. The bar shows only while dirty or busy. */
  dirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  busy?: boolean;
  /** A save error; replaces the message and is announced. */
  error?: ReactNode;
  /** Disables Save, e.g. while the form is invalid. */
  saveDisabled?: boolean;
  labels?: Partial<SaveBarLabels>;
  className?: string;
}

export function SaveBar({ dirty, onSave, onDiscard, busy, error, saveDisabled, labels, className }: SaveBarProps): JSX.Element | null {
  const l = { ...DEFAULT_LABELS, ...labels };
  if (!dirty && !busy) return null;
  return (
    <div className={cx("x-savebar", className)} role="region" aria-label={l.unsaved} data-error={error ? "true" : undefined}>
      <p className="x-savebar-msg" role={error ? "alert" : "status"}>
        {error ?? l.unsaved}
      </p>
      <div className="x-savebar-actions">
        <Button variant="secondary" onClick={onDiscard} disabled={busy}>
          {l.discard}
        </Button>
        <Button onClick={onSave} disabled={busy || saveDisabled}>
          {busy ? l.saving : l.save}
        </Button>
      </div>
    </div>
  );
}

export interface UnsavedGuard {
  /** Asks with `window.confirm(message)` when dirty; true means go ahead (not dirty, or the user agreed). Call it before an in-app navigation or before closing a Drawer. */
  confirmLeave: () => boolean;
}

/**
 * While `dirty`, the browser asks before the tab is closed or reloaded (beforeunload). In-app links are the router's
 * job: call `confirmLeave()` before navigating.
 */
export function useUnsavedGuard(dirty: boolean, message = "Leave this page? Your changes are not saved."): UnsavedGuard {
  useEffect(() => {
    if (!dirty || typeof window === "undefined") return;
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
  const confirmLeave = useCallback(() => !dirty || (typeof window !== "undefined" && window.confirm(message)), [dirty, message]);
  return { confirmLeave };
}
