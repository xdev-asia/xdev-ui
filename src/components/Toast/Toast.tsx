import type { JSX, ReactNode } from "react";
import { Button } from "../Button/Button";

export interface ToastLabels {
  dismiss: string;
}

const DEFAULT_LABELS: ToastLabels = { dismiss: "Dismiss" };

export interface ToastProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ToastLabels>;
}

export function Toast({ children, actionLabel, onAction, onDismiss, labels }: ToastProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div className="ws-toast" role="status">
      <span className="ws-toast-text">{children}</span>
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? (
        <button type="button" className="ws-tab-close" aria-label={l.dismiss} onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  );
}
