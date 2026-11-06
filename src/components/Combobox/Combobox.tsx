import { useId, useState, type JSX, type KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Tag } from "../Tag/Tag";
import { foldText } from "../../internal/text";

export interface ComboboxOption<T extends string = string> {
  value: T;
  label: string;
  /** Muted second line. */
  meta?: string;
  /** Shown but skipped by the arrow keys and ignored by Enter and click. */
  disabled?: boolean;
}

export interface ComboboxLabels {
  /** Line under the box when nothing matches the text. */
  noResults: string;
  /** The option that calls `onCreate`. */
  create: (text: string) => string;
  /** aria-label of a chip's remove button (multiple). */
  remove: (label: string) => string;
  /** aria-label of the clear button. */
  clear: string;
}

const DEFAULT_LABELS: ComboboxLabels = {
  noResults: "No results",
  create: (text) => `Create “${text}”`,
  remove: (label) => `Remove ${label}`,
  clear: "Clear",
};

interface ComboboxBaseProps<T extends string> {
  /** Accessible name of the box and the list; shown above the box unless `hideLabel`. */
  label: string;
  /** Keep `label` as aria-label only, when a heading or a table column already names the box. */
  hideLabel?: boolean;
  options: ComboboxOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  /** Draws the box as invalid and sets aria-invalid; pair it with a FieldMessage in `aria-describedby`. */
  invalid?: boolean;
  "aria-describedby"?: string;
  /** Adds a "Create “text”" option when the text matches no option exactly. */
  onCreate?: (text: string) => void;
  /** Whether `option` matches the typed `query`. Default: case- and diacritic-insensitive contains on the label. */
  filter?: (option: ComboboxOption<T>, query: string) => boolean;
  /** Opens the list on first render (previews, stories). */
  defaultOpen?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ComboboxLabels>;
  className?: string;
}

export interface ComboboxSingleProps<T extends string = string> extends ComboboxBaseProps<T> {
  multiple?: false;
  value: T | null;
  onChange: (value: T | null) => void;
}

export interface ComboboxMultipleProps<T extends string = string> extends ComboboxBaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

export type ComboboxProps<T extends string = string> = ComboboxSingleProps<T> | ComboboxMultipleProps<T>;

export { foldText };

/** Default filter: the folded label contains the folded, trimmed query. */
export function comboboxFilter(option: { label: string }, query: string): boolean {
  return foldText(option.label).includes(foldText(query.trim()));
}

/** Id of the "Create" row; option values never collide with it because rows of options use their value. */
export const COMBOBOX_CREATE = "\u0000create";

export type ComboboxRow<T extends string = string> =
  | { kind: "option"; id: T; option: ComboboxOption<T>; disabled?: boolean }
  | { kind: "create"; id: typeof COMBOBOX_CREATE; text: string; disabled?: undefined };

/** The rows of the list for `query`: matching options, then a Create row when `canCreate` and nothing matches exactly. Pure. */
export function comboboxRows<T extends string>(
  options: ComboboxOption<T>[],
  query: string,
  opts: { filter?: (option: ComboboxOption<T>, query: string) => boolean; canCreate?: boolean } = {},
): ComboboxRow<T>[] {
  const filter = opts.filter ?? comboboxFilter;
  const q = query.trim();
  const rows: ComboboxRow<T>[] = (q === "" ? options : options.filter((o) => filter(o, query))).map((o) => ({ kind: "option", id: o.value, option: o, disabled: o.disabled }));
  if (opts.canCreate && q !== "" && !options.some((o) => foldText(o.label) === foldText(q))) rows.push({ kind: "create", id: COMBOBOX_CREATE, text: q });
  return rows;
}

export interface ComboboxKeyState {
  rows: { id: string; disabled?: boolean }[];
  active: string | null;
  open: boolean;
  /** The text in the box. */
  text: string;
  multiple: boolean;
  /** Something is chosen (single) or at least one chip exists (multiple). */
  hasValue: boolean;
}

export interface ComboboxKeyResult {
  /** The key was used: call preventDefault. */
  handled: boolean;
  /** Keep the key from reaching a parent (Escape inside a dialog). */
  stop: boolean;
  open: boolean;
  active: string | null;
  /** Row id to pick. */
  pick: string | null;
  /** Escape on a closed list: empty the box (single: also clear the value). */
  clear: boolean;
  /** Backspace on an empty box (multiple): drop the last chip. */
  removeLast: boolean;
}

/** What a key does to the combobox. Arrows and Home/End move over enabled rows and wrap, Enter picks, Escape closes then clears, Tab closes. Pure. */
export function comboboxKey(s: ComboboxKeyState, key: string): ComboboxKeyResult {
  const none: ComboboxKeyResult = { handled: false, stop: false, open: s.open, active: s.active, pick: null, clear: false, removeLast: false };
  const enabled = (i: number): boolean => !s.rows[i]?.disabled;
  const at = s.rows.findIndex((r) => r.id === s.active && !r.disabled);
  const idAt = (i: number | null): string | null => (i === null || i < 0 ? null : (s.rows[i]?.id ?? null));
  const move = (k: string, from: number): string | null => {
    const i = rovingIndex(k, from, s.rows.length, "vertical", (n) => !enabled(n));
    return i === null || !enabled(i) ? null : idAt(i);
  };
  switch (key) {
    case "ArrowDown":
    case "ArrowUp": {
      if (!s.open) {
        const first = at >= 0 ? s.active : move(key === "ArrowDown" ? "Home" : "End", 0);
        return { ...none, handled: true, open: true, active: first };
      }
      return { ...none, handled: true, active: move(key, at >= 0 ? at : key === "ArrowDown" ? -1 : s.rows.length) };
    }
    case "Home":
    case "End":
      return s.open ? { ...none, handled: true, active: move(key, at) } : none;
    case "Enter": {
      if (!s.open || at < 0) return none;
      return { ...none, handled: true, pick: s.rows[at].id };
    }
    case "Escape":
      if (s.open) return { ...none, handled: true, stop: true, open: false };
      if (s.text !== "" || (!s.multiple && s.hasValue)) return { ...none, handled: true, stop: true, clear: true };
      return none;
    case "Backspace":
      return s.multiple && s.text === "" && s.hasValue ? { ...none, handled: true, removeLast: true } : none;
    case "Tab":
      return { ...none, open: false };
    default:
      return none;
  }
}

export function Combobox<T extends string = string>(props: ComboboxProps<T>): JSX.Element {
  const { label, hideLabel, options, placeholder, disabled, invalid, onCreate, filter, defaultOpen, labels, className } = props;
  const describedBy = props["aria-describedby"];
  const l = { ...DEFAULT_LABELS, ...labels };
  const base = `x-combobox-${useId()}`;
  const inputId = `${base}-input`;
  const listId = `${base}-list`;
  const [open, setOpen] = useState(Boolean(defaultOpen) && !disabled);
  // null: not editing, so a single box shows the chosen label.
  const [query, setQuery] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  const selected: T[] = props.multiple ? props.value : props.value === null ? [] : [props.value];
  const labelOf = (v: T): string => options.find((o) => o.value === v)?.label ?? v;
  const text = query ?? (props.multiple || props.value === null ? "" : labelOf(props.value));
  const rows = comboboxRows(options, query ?? "", { filter, canCreate: Boolean(onCreate) });
  const firstEnabled = rows.find((r) => !r.disabled)?.id ?? null;
  const active = rows.some((r) => r.id === chosen && !r.disabled) ? chosen : (rows.find((r) => !r.disabled && selected.includes(r.id as T))?.id ?? firstEnabled);
  const rowIndex = (id: string): number => rows.findIndex((r) => r.id === id);
  const optionId = (id: string): string => `${base}-opt-${rowIndex(id)}`;
  const expanded = open && !disabled;
  const showList = expanded && rows.length > 0;

  const setValues = (next: T[]): void => {
    if (props.multiple) props.onChange(next);
    else props.onChange(next[0] ?? null);
  };

  const pick = (id: string): void => {
    const row = rows.find((r) => r.id === id);
    if (!row || row.disabled) return;
    if (row.kind === "create") onCreate?.(row.text);
    else if (props.multiple) props.onChange(selected.includes(row.id) ? selected.filter((v) => v !== row.id) : [...selected, row.id]);
    else props.onChange(row.id);
    if (props.multiple) {
      setQuery("");
    } else {
      setQuery(null);
      setOpen(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    const r = comboboxKey({ rows, active, open: expanded, text, multiple: Boolean(props.multiple), hasValue: selected.length > 0 }, e.key);
    if (r.handled) e.preventDefault();
    if (r.stop) e.stopPropagation();
    if (r.open !== expanded) setOpen(r.open);
    if (r.active !== active) setChosen(r.active);
    if (r.pick !== null) pick(r.pick);
    if (r.clear) {
      setQuery("");
      if (!props.multiple) props.onChange(null);
    }
    if (r.removeLast) setValues(selected.slice(0, -1));
  };

  return (
    <div className={cx("x-combobox", className)} data-invalid={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      {hideLabel ? null : (
        <label className="x-combobox-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="x-combobox-box">
        {props.multiple
          ? selected.map((v) => (
              <Tag key={v} onRemove={disabled ? undefined : () => setValues(selected.filter((x) => x !== v))} removeLabel={l.remove(labelOf(v))}>
                {labelOf(v)}
              </Tag>
            ))
          : null}
        <input
          id={inputId}
          className="x-combobox-input"
          type="text"
          role="combobox"
          autoComplete="off"
          aria-label={hideLabel ? label : undefined}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active !== null ? optionId(active) : undefined}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          placeholder={props.multiple && selected.length > 0 ? undefined : placeholder}
          disabled={disabled}
          value={text}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            setOpen(false);
            setQuery(props.multiple ? "" : null);
          }}
        />
        {selected.length > 0 && !disabled ? (
          <IconButton
            icon="close"
            label={l.clear}
            className="x-combobox-clear"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValues([]);
              setQuery(props.multiple ? "" : null);
            }}
          />
        ) : null}
      </div>
      <div id={listId} className="x-combobox-list" role="listbox" aria-label={label} aria-multiselectable={props.multiple ? true : undefined} hidden={!showList}>
        {rows.map((row, i) => {
          const isActive = row.id === active;
          const isChosen = row.kind === "option" && selected.includes(row.id);
          return (
            <div
              key={row.kind === "create" ? COMBOBOX_CREATE : row.id}
              id={`${base}-opt-${i}`}
              className="x-list-row x-combobox-option"
              role="option"
              aria-selected={props.multiple ? isChosen : isActive}
              aria-disabled={row.disabled ? true : undefined}
              data-selected={isActive ? "" : undefined}
              data-checked={isChosen ? "" : undefined}
              data-disabled={row.disabled ? "" : undefined}
              data-create={row.kind === "create" ? "" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => (row.disabled ? undefined : setChosen(row.id))}
              onClick={() => pick(row.id)}
            >
              <span className="x-list-row-main">
                <span className="x-list-row-lead x-combobox-check">{row.kind === "create" ? <Icon name="plus" /> : isChosen ? <Icon name="check" /> : null}</span>
                <span className="x-list-row-text">
                  <span className="x-list-row-title">{row.kind === "create" ? l.create(row.text) : row.option.label}</span>
                  {row.kind === "option" && row.option.meta ? <span className="x-list-row-meta">{row.option.meta}</span> : null}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="x-combobox-status" aria-live="polite">
        {expanded && rows.length === 0 ? l.noResults : null}
      </div>
    </div>
  );
}
