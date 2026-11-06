import type { JSX, ReactNode } from "react";
import type { IconName } from "../../icons";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { ToastTone } from "./toast-store";

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
  /** Adds a tone icon and `data-tone`. "danger" is announced with role="alert". Default: none. */
  tone?: ToastTone;
  /** A second, quieter line under the message. */
  description?: ReactNode;
}

const TONE_ICON: Record<ToastTone, IconName> = { ok: "check", warn: "warn", danger: "alert", info: "info" };

export function Toast({ children, actionLabel, onAction, onDismiss, labels, tone, description }: ToastProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div className="ws-toast" role={tone === "danger" ? "alert" : "status"} data-tone={tone}>
      {tone ? <Icon name={TONE_ICON[tone]} className="ws-toast-icon" /> : null}
      <span className="ws-toast-text">
        {children}
        {description ? <span className="ws-toast-desc">{description}</span> : null}
      </span>
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
