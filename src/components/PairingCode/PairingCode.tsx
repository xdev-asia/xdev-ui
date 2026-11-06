import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { groupCode } from "../CodeInput/normalizeCode";
import { IconButton } from "../IconButton/IconButton";

export interface PairingCodeProps {
  /** The code, with or without separators: `7K4QM-2XD9P` or `482 913`. */
  value: string;
  /** Characters per group. Default 5; a check code of six digits uses 3. */
  groupSize?: number;
  /** Accessible name of the code ("Pairing code"). */
  label?: string;
  /** Shows a copy IconButton with this label ("Copy code"). */
  copyLabel?: string;
  /** Called by the copy button; the app writes to the clipboard. */
  onCopy?: () => void;
  /** Default "lg". */
  size?: "md" | "lg";
  className?: string;
}

export function PairingCode({ value, groupSize = 5, label, copyLabel, onCopy, size = "lg", className }: PairingCodeProps): JSX.Element {
  const groups = groupCode(value, groupSize);
  return (
    <div className={cx("x-pairing-code", className)} role="group" aria-label={label} data-size={size}>
      <span className="x-pairing-code-value" aria-live="polite">
        <span className="x-sr-only">{groups.join(" ")}</span>
        <span aria-hidden="true" className="x-pairing-code-groups">
          {groups.map((g, i) => (
            <span className="x-pairing-code-group" key={i}>
              {g}
            </span>
          ))}
        </span>
      </span>
      {copyLabel ? <IconButton icon="copy" label={copyLabel} onClick={onCopy} /> : null}
    </div>
  );
}
