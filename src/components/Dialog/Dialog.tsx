import { useEffect, useId, useRef, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { focusFirst, focusableIn, inertOutside, restoreFocus, trapTarget } from "../../internal/focus";
import { usePortal } from "../../internal/portal";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";

export interface DialogLabels {
  confirm: string;
  cancel: string;
  /** Accessible name of the close button (`dismissible`). */
  close: string;
}

const DEFAULT_LABELS: DialogLabels = { confirm: "OK", cancel: "Cancel", close: "Close" };

export interface DialogProps {
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  /** null hides Cancel. */
  cancelLabel?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** role="alertdialog" for destructive confirms; the body is its aria-describedby. */
  alert?: boolean;
  /** Fixed, full-viewport backdrop: Esc calls onCancel, Tab and Shift+Tab wrap inside the dialog, the page behind it is `inert`, focus moves in on mount and returns to the trigger on unmount. */
  modal?: boolean;
  /** Disables the confirm button, e.g. while saving or while the form is invalid. */
  confirmDisabled?: boolean;
  /** Override the English defaults (e.g. for vi). confirmLabel and cancelLabel win over these. */
  labels?: Partial<DialogLabels>;
  /** "wide" fills most of the window (a diagram, an image). Default "default", 440px. */
  size?: "default" | "wide";
  /** "plain" wraps children in a div, for block content; "text" wraps them in a p. Default: p for a string or number, div otherwise. */
  body?: "text" | "plain";
  /** One line under the title, linked with aria-describedby. */
  description?: ReactNode;
  /** "danger" gives the confirm button the danger variant (destructive confirms). */
  tone?: "default" | "danger";
  /** Working: both actions are disabled, the confirm button shows a spinner and Esc is ignored. */
  busy?: boolean;
  /** With `modal`, render into `document.body` once mounted, so no parent's overflow, transform or z-index clips it. Default true. */
  portal?: boolean;
  /** More choices between Cancel and the confirm button, as secondary `Button`s: "Only this one" next to "Whole series". */
  secondaryActions?: ReactNode;
  /** Replaces the built-in Cancel and confirm buttons with your own row (a form's submit, a single Close). `null` renders no action row. */
  actions?: ReactNode;
  /** Adds a close button (×) beside the title that calls onCancel. Use it when the dialog has no Cancel button of its own. */
  dismissible?: boolean;
}

export function Dialog({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel, alert, modal, confirmDisabled, labels, size = "default", body, description, tone, busy, portal = true, secondaryActions, actions, dismissible }: DialogProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const cancelText = cancelLabel === undefined ? l.cancel : cancelLabel;
  const id = useId();
  const titleId = `x-dialog-${id}`;
  const descId = `x-dialog-d-${id}`;
  const bodyId = `${titleId}-body`;
  const ref = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const inPortal = usePortal(Boolean(modal) && portal);
  useEffect(() => {
    if (!modal) return;
    const trigger = document.activeElement as HTMLElement | null;
    const release = inertOutside(backdropRef.current);
    focusFirst(ref.current);
    return () => {
      release();
      restoreFocus(trigger);
    };
  }, [modal, inPortal.active]);
  const onKeyDown = modal
    ? (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (!busy) onCancel?.();
        } else if (e.key === "Tab") {
          const target = trapTarget(focusableIn(ref.current), document.activeElement, e.shiftKey);
          if (target) {
            e.preventDefault();
            target.focus();
          }
        }
      }
    : undefined;
  const asText = body ? body === "text" : typeof children === "string" || typeof children === "number";
  return inPortal(
    <div className="dialog-backdrop" ref={backdropRef} data-modal={modal ? "true" : undefined} onKeyDown={onKeyDown}>
      <div className="dialog" data-size={size} ref={ref} tabIndex={modal ? -1 : undefined} role={alert ? "alertdialog" : "dialog"} aria-modal={modal ? "true" : undefined} aria-labelledby={titleId} aria-describedby={[description ? descId : null, alert && children ? bodyId : null].filter(Boolean).join(" ") || undefined} aria-busy={busy ? "true" : undefined}>
        {dismissible ? (
          <div className="dialog-head">
            <div className="dialog-head-text">
              <h2 className="dialog-title" id={titleId}>
                {title}
              </h2>
              {description ? (
                <p className="dialog-desc" id={descId}>
                  {description}
                </p>
              ) : null}
            </div>
            <IconButton icon="close" label={l.close} onClick={onCancel} disabled={busy || undefined} />
          </div>
        ) : (
          <>
            <h2 className="dialog-title" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="dialog-desc" id={descId}>
                {description}
              </p>
            ) : null}
          </>
        )}
        {!children ? null : asText ? <p className="dialog-body" id={alert ? bodyId : undefined}>{children}</p> : <div className="dialog-body" id={alert ? bodyId : undefined}>{children}</div>}
        {actions !== undefined ? (
          actions === null ? null : <div className="dialog-actions">{actions}</div>
        ) : (
        <div className="dialog-actions">
          {cancelText !== null ? (
            <Button variant="secondary" onClick={onCancel} disabled={busy || undefined}>
              {cancelText}
            </Button>
          ) : null}
          {secondaryActions}
          <Button onClick={onConfirm} disabled={confirmDisabled || busy || undefined} variant={tone === "danger" ? "danger" : "primary"}>
            {busy ? (
              <span className="x-spinner" data-size="sm" aria-hidden="true">
                <span className="x-spinner-ring" />
              </span>
            ) : null}
            {confirmLabel ?? l.confirm}
          </Button>
        </div>
        )}
      </div>
    </div>,
  ) as JSX.Element;
}
