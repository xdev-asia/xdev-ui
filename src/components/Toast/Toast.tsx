import type { JSX, ReactNode } from "react";
import { Button } from "../Button/Button";

export interface ToastProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function Toast({ children, actionLabel, onAction, onDismiss }: ToastProps): JSX.Element {
  return (
    <div className="ws-toast" role="status">
      <span className="ws-toast-text">{children}</span>
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? (
        <button type="button" className="ws-tab-close" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  );
}
