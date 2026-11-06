import { useEffect, type KeyboardEvent, type RefObject } from "react";
import { focusFirst, focusableIn, inertOutside, restoreFocus, trapTarget } from "./focus";

/**
 * Modal behaviour shared by Drawer and FormDialog (Dialog keeps its own copy): on mount the page outside `root`
 * becomes inert and focus moves into `panel`; on unmount both are undone. The returned handler, put on `root`,
 * calls `onEscape` on Esc and keeps Tab inside `panel`.
 */
export function useModal(
  active: boolean,
  root: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  onEscape: () => void,
): ((e: KeyboardEvent<HTMLElement>) => void) | undefined {
  useEffect(() => {
    if (!active) return;
    const trigger = document.activeElement as HTMLElement | null;
    const release = inertOutside(root.current);
    focusFirst(panel.current);
    return () => {
      release();
      restoreFocus(trigger);
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable
  if (!active) return undefined;
  return (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onEscape();
    } else if (e.key === "Tab") {
      const target = trapTarget(focusableIn(panel.current), document.activeElement, e.shiftKey);
      if (target) {
        e.preventDefault();
        target.focus();
      }
    }
  };
}
