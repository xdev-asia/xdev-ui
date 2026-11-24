import { useEffect, useId, useLayoutEffect, useRef, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { usePortal } from "../../internal/portal";
import { onViewportChange, positionPanel } from "../../internal/position";

/** Props to spread on the trigger button when `trigger` is a function. */
export interface PopoverTriggerProps {
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "dialog";
}

export interface PopoverProps {
  /** Controlled open state. */
  open: boolean;
  /** Called on Escape and on a click outside the panel. */
  onClose: () => void;
  /** The anchor. A function receives ARIA props for the button that opens the panel. */
  trigger?: ReactNode | ((props: PopoverTriggerProps) => ReactNode);
  /** Where the panel sits against the anchor. Default "bottom-start". */
  placement?: "bottom-start" | "bottom-end" | "top-start";
  /** aria-label of the panel ("Notifications"). */
  label?: string;
  /** Render the panel into `document.body` (position: fixed, flips above when there is no room below). Default true; false keeps it inside the anchor. */
  portal?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Popover({ open, onClose, trigger, placement = "bottom-start", label, portal = true, children, className }: PopoverProps): JSX.Element {
  const panelId = `x-pop-${useId()}`;
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const inPortal = usePortal(portal);
  const portalled = inPortal.active;

  useLayoutEffect(() => {
    if (!open || !portalled) return;
    const opts = {
      side: placement === "top-start" ? "top" : "bottom",
      align: placement === "bottom-end" ? "end" : "start",
    } as const;
    const place = (): void => void positionPanel(anchor.current, panel.current, opts);
    place();
    return onViewportChange(place);
  }, [open, portalled, placement]);

  // Mounted open (a preview, a restored state) is not a person opening it: focus stays put and the page does not
  // scroll to the panel. Every later open moves focus in.
  const openedOnMount = useRef(open);
  useEffect(() => {
    if (!open) {
      openedOnMount.current = false;
      return;
    }
    if (openedOnMount.current) return;
    // Focus goes back to the trigger. Read it from the anchor: a child (a Menu) may already have moved focus inside
    // the panel, because child effects run first.
    const trigger = anchor.current?.querySelector<HTMLElement>("button, a[href], [tabindex]");
    const active = document.activeElement as HTMLElement | null;
    const back = trigger ?? (panel.current?.contains(active) ? null : active);
    // A child that already took focus (a Menu's first item) keeps it; otherwise the panel takes it.
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
      }
    };
    // Tabbing out of the panel closes it, so it never stays open behind the focus.
    const onFocusOut = (e: FocusEvent): void => {
      const to = e.relatedTarget as Node | null;
      if (!to || panel.current?.contains(to) || anchor.current?.contains(to)) return;
      close.current();
    };
    const node = panel.current;
    document.addEventListener("keydown", onKey);
    node?.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("keydown", onKey);
      node?.removeEventListener("focusout", onFocusOut);
      // Only when focus is still in the panel or lost: a Tab out already put it somewhere on purpose.
      const now = document.activeElement;
      if (!now || now === document.body || node?.contains(now)) back?.focus?.();
    };
  }, [open, portalled]);

  const triggerProps: PopoverTriggerProps = {
    "aria-expanded": open,
    "aria-controls": panelId,
    "aria-haspopup": "dialog",
  };
  return (
    <span className="x-popover-anchor" ref={anchor}>
      {typeof trigger === "function" ? trigger(triggerProps) : trigger}
      {open
        ? inPortal(
            <>
              <div className="ws-menu-backdrop" aria-hidden="true" onClick={onClose} />
              <div
                ref={panel}
                id={panelId}
                className={cx("x-popover", className)}
                role="dialog"
                aria-label={label}
                data-placement={placement}
                data-portal={portalled ? "" : undefined}
                tabIndex={-1}
              >
                {children}
              </div>
            </>,
          )
        : null}
    </span>
  );
}
