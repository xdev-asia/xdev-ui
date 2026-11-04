import { useId, type JSX, type ReactNode } from "react";
import { Button } from "../Button/Button";

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
}

export function Dialog({ title, children, confirmLabel = "OK", cancelLabel = "Cancel", onConfirm, onCancel, alert }: DialogProps): JSX.Element {
  const titleId = `x-dialog-${useId()}`;
  return (
    <div className="dialog-backdrop">
      <div className="dialog" role={alert ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={titleId}>
        <h2 className="dialog-title" id={titleId}>
          {title}
        </h2>
        {children ? <p className="dialog-body">{children}</p> : null}
        <div className="dialog-actions">
          {cancelLabel !== null ? (
            <Button variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
