import { useId, type JSX, type ReactNode } from "react";
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
  /** Override the English defaults (e.g. for vi). confirmLabel and cancelLabel win over these. */
  labels?: Partial<DialogLabels>;
}

export function Dialog({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel, alert, labels }: DialogProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const cancelText = cancelLabel === undefined ? l.cancel : cancelLabel;
  const titleId = `x-dialog-${useId()}`;
  return (
    <div className="dialog-backdrop">
      <div className="dialog" role={alert ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={titleId}>
        <h2 className="dialog-title" id={titleId}>
          {title}
        </h2>
        {children ? <p className="dialog-body">{children}</p> : null}
        <div className="dialog-actions">
          {cancelText !== null ? (
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          ) : null}
          <Button onClick={onConfirm}>{confirmLabel ?? l.confirm}</Button>
        </div>
      </div>
    </div>
  );
}
