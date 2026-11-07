import type { JSX, KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";

export interface ComposerLabels {
  /** aria-label of the text box. */
  input: string;
  send: string;
  attach: string;
  /** aria-label of the model select. */
  model: string;
}

const DEFAULT_LABELS: ComposerLabels = {
  input: "Message",
  send: "Send",
  attach: "Attach a file",
  model: "Model",
};

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Called with Enter or the Send button. Not called while `value` is blank or `disabled`. */
  onSend: () => void;
  /** The model select; omitted when not given. */
  model?: { value: string; options: { value: string; label: string }[] };
  onModel?: (value: string) => void;
  /** Adds the attach button when given. */
  onAttach?: () => void;
  disabled?: boolean;
  placeholder?: string;
  labels?: Partial<ComposerLabels>;
  className?: string;
}

export function Composer({ value, onChange, onSend, model, onModel, onAttach, disabled, placeholder, labels, className }: ComposerProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const blank = value.trim() === "";
  const send = (): void => {
    if (!disabled && !blank) onSend();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter sends; Shift+Enter keeps the newline; Enter during IME composition is left to the IME.
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    send();
  };
  return (
    <div className={cx("x-composer", className)} data-disabled={disabled ? "" : undefined}>
      <textarea
        className="kit-textarea x-composer-input"
        data-resize="none"
        rows={2}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={l.input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="x-composer-bar">
        {onAttach ? <IconButton icon="upload" label={l.attach} size="sm" disabled={disabled} onClick={onAttach} /> : null}
        {model ? (
          <Select
            className="x-composer-model"
            aria-label={l.model}
            value={model.value}
            options={model.options}
            disabled={disabled}
            onChange={(e) => onModel?.(e.target.value)}
          />
        ) : null}
        <Button variant="primary" size="sm" type="button" icon="send" className="x-composer-send" disabled={disabled || blank} onClick={send}>
          {l.send}
        </Button>
      </div>
    </div>
  );
}
