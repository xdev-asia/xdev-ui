import { useEffect, useRef, useState, type JSX } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export interface PaletteTriggerLabels {
  /** Text in the field and the button's name. */
  search: string;
}

const DEFAULT_LABELS: PaletteTriggerLabels = { search: "Search" };

export interface PaletteTriggerProps {
  /** Opens your `CommandPalette`. */
  onOpen: () => void;
  /** Listen for Ctrl+K (Cmd+K on a Mac) on the whole page. Default true. Turn it off when the app binds the key itself. */
  hotkey?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<PaletteTriggerLabels>;
  className?: string;
}

const isMac = (): boolean => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** A search field look-alike for the sidebar or top bar that opens the command palette, with its shortcut shown. */
export function PaletteTrigger({ onOpen, hotkey = true, labels, className }: PaletteTriggerProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [mac, setMac] = useState(false);
  const open = useRef(onOpen);
  open.current = onOpen;
  useEffect(() => setMac(isMac()), []);
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        open.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey]);
  return (
    <button type="button" className={cx("x-palette-trigger", className)} aria-haspopup="dialog" aria-keyshortcuts={hotkey ? "Control+K Meta+K" : undefined} onClick={onOpen}>
      <Icon name="search" size={16} className="x-palette-trigger-icon" />
      <span className="x-palette-trigger-text">{l.search}</span>
      {hotkey ? (
        <kbd className="kbd x-palette-trigger-key" aria-hidden="true">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      ) : null}
    </button>
  );
}
