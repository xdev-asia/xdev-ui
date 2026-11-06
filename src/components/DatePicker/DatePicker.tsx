import { useEffect, useId, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { addMonths, clampIso, formatDate, isDayDisabled, isIso, isoFromDate, parseDateText, type WeekDay } from "../../internal/date";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Popover } from "../Popover/Popover";
import { Calendar } from "./Calendar";

export interface DatePickerLabels {
  /** Calendar button. */
  openCalendar: string;
  /** Name of the calendar popover. */
  calendar: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  clear: string;
  /** Shown under the field when typed text is not a date that can be picked. */
  invalid: string;
}

export const DATE_PICKER_LABELS: DatePickerLabels = {
  openCalendar: "Open calendar",
  calendar: "Choose date",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  today: "Today",
  clear: "Clear",
  invalid: "Enter a valid date",
};

export interface DatePickerProps {
  label: ReactNode;
  /** ISO `YYYY-MM-DD`, or null for no date. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Earliest day that can be picked (ISO). */
  min?: string;
  /** Latest day that can be picked (ISO). */
  max?: string;
  disabled?: boolean;
  /** Extra days that cannot be picked (weekends, holidays). */
  isDateDisabled?: (iso: string) => boolean;
  /** BCP 47 locale for month and weekday names. Default "en". */
  locale?: string;
  /** Display and typing pattern of `dd`, `mm` and `yyyy`. Default "dd/mm/yyyy". */
  format?: string;
  /** 0 = Sunday … 6 = Saturday. Default 1 (Monday). */
  weekStartsOn?: WeekDay;
  /** "Today" as ISO; defaults to the local date. Pass it for SSR or tests. */
  today?: string;
  hint?: ReactNode;
  /** Replaces the hint and marks the field invalid. */
  error?: ReactNode;
  /** Name of a hidden input that carries the ISO value in a form. */
  name?: string;
  id?: string;
  /** Opens the calendar on mount (previews). */
  defaultOpen?: boolean;
  labels?: Partial<DatePickerLabels>;
  className?: string;
}

export function DatePicker({
  label,
  value: rawValue,
  onChange,
  min,
  max,
  disabled,
  isDateDisabled,
  locale = "en",
  format = "dd/mm/yyyy",
  weekStartsOn = 1,
  today: todayProp,
  hint,
  error,
  name,
  id,
  defaultOpen = false,
  labels,
  className,
}: DatePickerProps): JSX.Element {
  const l = { ...DATE_PICKER_LABELS, ...labels };
  const value = isIso(rawValue) ? rawValue : null;
  const today = isIso(todayProp) ? todayProp : isoFromDate(new Date());
  const auto = useId();
  const inputId = id ?? `x-date-${auto}`;
  const [open, setOpen] = useState(defaultOpen);
  const [focused, setFocused] = useState(() => clampIso(value ?? today, min, max));
  const [draft, setDraft] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const moveFocus = useRef(defaultOpen);

  // Runs after Popover's own effect (a child), so the day wins over the panel for focus.
  useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [open, focused]);

  const show = (): void => {
    setFocused(clampIso(value ?? today, min, max));
    moveFocus.current = true;
    setOpen(true);
  };
  const pick = (iso: string | null): void => {
    onChange(iso);
    setDraft(null);
    setBad(false);
    if (iso) setFocused(iso);
    setOpen(false);
  };
  const commit = (): void => {
    if (draft === null) return;
    if (draft.trim() === "") return pick(null);
    const iso = parseDateText(draft, format);
    if (iso && !isDayDisabled(iso, min, max, isDateDisabled)) {
      if (iso !== value) onChange(iso);
      setDraft(null);
      setBad(false);
      setFocused(iso);
    } else setBad(true);
  };
  const onInputKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") commit();
    else if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      show();
    }
  };

  const note = error ?? (bad ? l.invalid : hint);
  const noteId = note ? `${inputId}-note` : undefined;
  const invalid = !!error || bad;
  const todayOff = isDayDisabled(today, min, max, isDateDisabled);

  return (
    <div className={cx("ws-field x-date-picker", className)} data-invalid={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <label htmlFor={inputId}>{label}</label>
      <div className="x-date-control">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={format}
          value={draft ?? formatDate(value, format)}
          disabled={disabled}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={noteId}
          onChange={(e) => {
            setDraft(e.target.value);
            setBad(false);
          }}
          onBlur={commit}
          onKeyDown={onInputKey}
        />
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          placement="bottom-end"
          label={l.calendar}
          className="x-date-popover"
          trigger={(t) => <IconButton icon="calendar" label={l.openCalendar} disabled={disabled} onClick={() => (open ? setOpen(false) : show())} {...t} />}
        >
          <Calendar
            view={focused}
            months={1}
            focused={focused}
            today={today}
            locale={locale}
            weekStartsOn={weekStartsOn}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            range={{ start: value, end: value }}
            onFocusChange={(iso) => {
              moveFocus.current = true;
              setFocused(iso);
            }}
            onMonthStep={(d) => setFocused((f) => clampIso(addMonths(f, d), min, max))}
            onPick={pick}
            labels={l}
            idBase={`${inputId}-cal`}
            gridRef={gridRef}
          />
          <div className="x-calendar-footer">
            <Button variant="secondary" onClick={() => pick(null)} disabled={value === null}>
              {l.clear}
            </Button>
            <Button variant="secondary" onClick={() => pick(today)} disabled={todayOff}>
              {l.today}
            </Button>
          </div>
        </Popover>
      </div>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      {note ? <small id={noteId}>{note}</small> : null}
    </div>
  );
}
