import { useState, type JSX } from "react";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** aria-label of the group. */
  label?: string;
}

export function Segmented({ options, value, defaultValue, onChange, label }: SegmentedProps): JSX.Element {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === current}
          onClick={() => {
            setInner(o.value);
            onChange?.(o.value);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
