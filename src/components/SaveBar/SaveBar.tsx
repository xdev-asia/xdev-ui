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

const DEFAULT_LABELS: SaveBarLabels = { unsaved: "You have unsaved changes", save: "Save", discard: "Discard", saving: "Saving…" };

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
        <Button variant="primary" onClick={onSave} disabled={busy || saveDisabled}>
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

export interface UnsavedGuardOptions {
  /**
   * Also ask before following a same-page link while dirty: a click on an `<a href>` whose target is in this
   * document (a `#/route` hash link from `NavList` or `Breadcrumb`, or a same-origin path). The click is cancelled
   * when the user says no. Off by default, so a router that already calls `confirmLeave()` does not ask twice.
   */
  guardLinks?: boolean;
}

/**
 * Pure: whether a click on a link with `href` leaves the current view inside the same document (and so needs
 * `confirmLeave`). `here` is the current URL. Hash-only links that keep the current hash, other origins, `target`
 * other than `_self`, `download` links and modified clicks are not in-app navigations.
 */
export function isInAppNavigation(
  link: { href: string; target?: string | null; download?: boolean },
  here: string,
  click: { button?: number; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): boolean {
  if ((click.button ?? 0) !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return false;
  if (link.download || (link.target && link.target !== "_self")) return false;
  let to: URL;
  let from: URL;
  try {
    from = new URL(here);
    to = new URL(link.href, from);
  } catch {
    return false;
  }
  if (to.origin !== from.origin) return false;
  return to.pathname !== from.pathname || to.search !== from.search || to.hash !== from.hash;
}

/**
 * While `dirty`, the browser asks before the tab is closed or reloaded (beforeunload). In-app links are the router's
 * job: call `confirmLeave()` before navigating, or pass `{ guardLinks: true }` to have same-page link clicks
 * (hash routes included) ask first.
 */
export function useUnsavedGuard(dirty: boolean, message = "Leave this page? Your changes are not saved.", options: UnsavedGuardOptions = {}): UnsavedGuard {
  const { guardLinks = false } = options;
  useEffect(() => {
    if (!dirty || typeof window === "undefined") return;
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
  useEffect(() => {
    if (!dirty || !guardLinks || typeof document === "undefined") return;
    const onClick = (e: MouseEvent): void => {
      if (e.defaultPrevented) return;
      const target = e.target as Element | null;
      const a = target && typeof target.closest === "function" ? (target.closest("a[href]") as HTMLAnchorElement | null) : null;
      if (!a) return;
      if (!isInAppNavigation({ href: a.href, target: a.target, download: a.hasAttribute("download") }, window.location.href, e)) return;
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, guardLinks, message]);
  const confirmLeave = useCallback(() => !dirty || (typeof window !== "undefined" && window.confirm(message)), [dirty, message]);
  return { confirmLeave };
}
