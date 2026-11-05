import { useEffect, useId, useRef, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { focusFirst, focusableIn, inertOutside, restoreFocus, trapTarget } from "../../internal/focus";
import { Button } from "../Button/Button";

export interface DialogLabels {
  confirm: string;
  cancel: string;
}

const DEFAULT_LABELS: DialogLabels = { confirm: "OK", cancel: "Cancel" };

export interface DialogProps {
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  /** null hides Cancel. */
  cancelLabel?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** role="alertdialog" for destructive confirms. */
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
}

export function Dialog({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel, alert, modal, confirmDisabled, labels, size = "default", body }: DialogProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const cancelText = cancelLabel === undefined ? l.cancel : cancelLabel;
  const titleId = `x-dialog-${useId()}`;
  const ref = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!modal) return;
    const trigger = document.activeElement as HTMLElement | null;
    const release = inertOutside(backdropRef.current);
    focusFirst(ref.current);
    return () => {
      release();
      restoreFocus(trigger);
    };
  }, [modal]);
  const onKeyDown = modal
    ? (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel?.();
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
  return (
    <div className="dialog-backdrop" ref={backdropRef} data-modal={modal ? "true" : undefined} onKeyDown={onKeyDown}>
      <div className="dialog" data-size={size} ref={ref} tabIndex={modal ? -1 : undefined} role={alert ? "alertdialog" : "dialog"} aria-modal={modal ? "true" : undefined} aria-labelledby={titleId}>
        <h2 className="dialog-title" id={titleId}>
          {title}
        </h2>
        {!children ? null : asText ? <p className="dialog-body">{children}</p> : <div className="dialog-body">{children}</div>}
        <div className="dialog-actions">
          {cancelText !== null ? (
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          ) : null}
          <Button onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel ?? l.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
