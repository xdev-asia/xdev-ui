import { useEffect } from "react";
/** After a failed submit, move focus to the first field marked invalid, once React has painted the errors. */
export function focusFirstInvalid(root: HTMLElement | null | undefined): void {
  if (!root || typeof window === "undefined") return;
  window.requestAnimationFrame(() => root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * When the focused control goes away (a bulk bar that closes, a Save that turns disabled, a link to another page),
 * the browser drops focus on <body> and keyboard and screen-reader users lose their place. This moves it to the
 * open modal dialog, else to <main>, so the next Tab continues from there.
 */
export function useFocusRescue(): void {
  useEffect(() => {
    let timer = 0;
    const onOut = (e: FocusEvent): void => {
      if (e.relatedTarget) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.activeElement !== document.body || !document.hasFocus()) return;
        const modals = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"], [role="alertdialog"]');
        const modal = modals[modals.length - 1];
        const target = modal ? (modal.querySelector<HTMLElement>(TABBABLE) ?? modal) : (document.getElementById("main") ?? document.querySelector<HTMLElement>("main"));
        if (!target) return;
        if (!target.matches(TABBABLE) && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, 0);
    };
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusout", onOut);
      window.clearTimeout(timer);
    };
  }, []);
}
