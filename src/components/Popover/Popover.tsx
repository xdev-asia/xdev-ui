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

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      back?.focus?.();
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
