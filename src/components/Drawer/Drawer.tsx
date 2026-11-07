import { useId, useRef, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { useModal } from "../../internal/modal";
import { usePortal } from "../../internal/portal";
import { IconButton } from "../IconButton/IconButton";

export interface DrawerLabels {
  close: string;
}

const DEFAULT_LABELS: DrawerLabels = { close: "Close" };

export interface DrawerProps {
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  /** Actions pinned to the bottom (Cancel, then the primary Button). */
  footer?: ReactNode;
  /** Esc, the close button and a click on the backdrop call it. Not called while `busy`. */
  onClose: () => void;
  /** Ignore close requests, e.g. while saving. */
  busy?: boolean;
  /** "default" 420px, "wide" 640px; both cap at the viewport. */
  size?: "default" | "wide";
  /** Which edge it slides from. Default "end" (right in LTR). "bottom" is a sheet: full width, capped at 85% of the height. */
  side?: "end" | "start" | "bottom";
  /** false renders the markup only (previews); default true traps focus and makes the page inert. */
  modal?: boolean;
  labels?: Partial<DrawerLabels>;
  /** With `modal`, render into `document.body` once mounted, so no parent's overflow, transform or z-index clips it. Default true. */
  portal?: boolean;
  className?: string;
}

export function Drawer({ title, description, children, footer, onClose, busy, size = "default", side = "end", modal = true, labels, portal = true, className }: DrawerProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const titleId = `x-drawer-${id}`;
  const descId = `x-drawer-d-${id}`;
  const root = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const close = (): void => {
    if (!busy) onClose();
  };
  const inPortal = usePortal(modal && portal);
  const onKeyDown = useModal(modal, root, panel, close, inPortal.active);
  return inPortal(
    <div className="x-drawer-root" ref={root} data-modal={modal ? "true" : undefined} onKeyDown={onKeyDown}>
      <div className="x-drawer-backdrop" aria-hidden="true" onClick={close} />
      <div
        ref={panel}
        className={cx("x-drawer", className)}
        role="dialog"
        aria-modal={modal ? "true" : undefined}
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        aria-busy={busy ? "true" : undefined}
        data-size={size}
        data-side={side}
        tabIndex={-1}
      >
        <header className="x-drawer-head">
          <div>
            <h2 className="x-drawer-title" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="x-drawer-desc" id={descId}>
                {description}
              </p>
            ) : null}
          </div>
          <IconButton icon="close" label={l.close} onClick={close} disabled={busy} />
        </header>
        <div className="x-drawer-body">{children}</div>
        {footer ? <footer className="x-drawer-foot">{footer}</footer> : null}
      </div>
    </div>,
  ) as JSX.Element;
}
