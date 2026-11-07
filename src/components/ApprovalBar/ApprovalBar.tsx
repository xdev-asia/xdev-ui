import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";

export interface ApprovalBarLabels {
  /** aria-label of the group. */
  region: string;
  allow: string;
  always: string;
  deny: string;
}

const DEFAULT_LABELS: ApprovalBarLabels = {
  region: "Approval needed",
  allow: "Allow",
  always: "Always allow",
  deny: "Deny",
};

export interface ApprovalBarProps {
  /** What the agent asks to do, e.g. "Run a shell command". */
  title: string;
  /** The command or path the request is about; shown in a mono block. */
  command?: string;
  onAllow: () => void;
  /** Adds the "Always allow" button when given. */
  onAlways?: () => void;
  onDeny: () => void;
  /** Disables the buttons while the answer is sent. */
  busy?: boolean;
  labels?: Partial<ApprovalBarLabels>;
  className?: string;
}

export function ApprovalBar({ title, command, onAllow, onAlways, onDeny, busy, labels, className }: ApprovalBarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} className={cx("x-approval", className)} role="group" aria-label={l.region} tabIndex={-1}>
      <div className="x-approval-text" role="status">
        <span className="x-approval-title">{title}</span>
        {command ? <code className="x-approval-command">{command}</code> : null}
      </div>
      <div className="x-approval-actions">
        <Button variant="primary" size="sm" type="button" disabled={busy} onClick={onAllow}>
          {l.allow}
        </Button>
        {onAlways ? (
          <Button variant="secondary" size="sm" type="button" disabled={busy} onClick={onAlways}>
            {l.always}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" type="button" disabled={busy} onClick={onDeny}>
          {l.deny}
        </Button>
      </div>
    </div>
  );
}
