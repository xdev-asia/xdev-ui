import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export interface ModelChipProps {
  /** The id a client sends, shown in a mono pill: `openai/gpt-5.5`. */
  code: string;
  /** The model's display name, under the pill. */
  name?: ReactNode;
  /** Before the pill. Default: the `bot` icon. */
  leading?: ReactNode;
  /** Right of the pill: one IconButton (size "sm"), usually Copy. */
  codeAction?: ReactNode;
  /** Right of the name: IconButtons (size "sm") such as Hide, Test, Remove. */
  actions?: ReactNode;
  /** Draws the chip fainter, for a model that is turned off. */
  dimmed?: boolean;
  className?: string;
}

/** One model in a provider's list: its id in a mono pill, its display name, and small actions beside each. */
export function ModelChip({ code, name, leading, codeAction, actions, dimmed = false, className }: ModelChipProps): JSX.Element {
  return (
    <div className={cx("x-model-chip", className)} data-dimmed={dimmed ? "" : undefined}>
      <span className="x-model-chip-lead">{leading ?? <Icon name="bot" />}</span>
      <span className="x-model-chip-body">
        <span className="x-model-chip-line">
          <code className="x-model-chip-code" title={code}>
            {code}
          </code>
          {codeAction}
        </span>
        {name || actions ? (
          <span className="x-model-chip-line">
            {name ? <span className="x-model-chip-name">{name}</span> : null}
            {actions ? <span className="x-model-chip-actions">{actions}</span> : null}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export interface ModelChipAddProps {
  /** Verb label: "Add model". */
  label: string;
  onClick: () => void;
  className?: string;
}

/** The last chip of a model list: a dashed button that adds a model. */
export function ModelChipAdd({ label, onClick, className }: ModelChipAddProps): JSX.Element {
  return (
    <button type="button" className={cx("x-model-chip x-model-chip-add", className)} onClick={onClick}>
      <Icon name="plus" />
      <span>{label}</span>
    </button>
  );
}
