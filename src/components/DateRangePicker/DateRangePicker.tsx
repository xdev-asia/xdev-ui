import { useEffect, useId, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import {
  addMonths,
  clampIso,
  formatDate,
  isDayDisabled,
  isIso,
  isoFromDate,
  keepInView,
  orderRange,
  parseDateText,
  pickRange,
  startOfMonth,
  type DateRange,
  type WeekDay,
} from "../../internal/date";
import { Button } from "../Button/Button";
import { Calendar } from "../DatePicker/Calendar";
import { IconButton } from "../IconButton/IconButton";
import { Popover } from "../Popover/Popover";

export type { DateRange };

export interface DateRangePreset {
  label: string;
  range: DateRange;
}

export interface DateRangePickerLabels {
  openCalendar: string;
  /** Name of the calendar popover. */
  calendar: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  clear: string;
  /** Name of the first text box. */
  start: string;
  /** Name of the second text box. */
  end: string;
  /** Name of the preset list. */
  presets: string;
  /** Shown under the field when typed text is not a date that can be picked. */
  invalid: string;
}

export const DATE_RANGE_PICKER_LABELS: DateRangePickerLabels = {
  openCalendar: "Open calendar",
  calendar: "Choose dates",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  today: "Today",
  clear: "Clear",
  start: "Start date",
  end: "End date",
  presets: "Presets",
  invalid: "Enter a valid date",
};

export interface DateRangePickerProps {
  label: ReactNode;
  /** ISO `YYYY-MM-DD` ends; either may be null. */
  value: DateRange;
  onChange: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  isDateDisabled?: (iso: string) => boolean;
  /** BCP 47 locale for month and weekday names. Default "en". */
  locale?: string;
  /** Display and typing pattern of `dd`, `mm` and `yyyy`. Default "dd/mm/yyyy". */
  format?: string;
  /** 0 = Sunday … 6 = Saturday. Default 1 (Monday). */
  weekStartsOn?: WeekDay;
  /** "Today" as ISO; defaults to the local date. Pass it for SSR or tests. */
  today?: string;
  /** Quick ranges listed beside the calendar ("Last 7 days"). */
  presets?: DateRangePreset[];
  hint?: ReactNode;
  /** Replaces the hint and marks the field invalid. */
  error?: ReactNode;
  id?: string;
  /** Opens the calendar on mount (previews). */
  defaultOpen?: boolean;
  labels?: Partial<DateRangePickerLabels>;
  className?: string;
}

type End = "start" | "end";

/** The range after typing `iso` (or clearing with null) into one end; the ends swap when they cross. Pure. */
export function setRangeEnd(range: DateRange, which: End, iso: string | null): DateRange {
  const next = { ...range, [which]: iso };
  return next.start && next.end ? orderRange(next.start, next.end) : next;
}

export function DateRangePicker({
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
  presets,
  hint,
  error,
  id,
  defaultOpen = false,
  labels,
  className,
}: DateRangePickerProps): JSX.Element {
  const l = { ...DATE_RANGE_PICKER_LABELS, ...labels };
  const value: DateRange = { start: isIso(rawValue?.start) ? rawValue.start : null, end: isIso(rawValue?.end) ? rawValue.end : null };
  const today = isIso(todayProp) ? todayProp : isoFromDate(new Date());
  const auto = useId();
  const base = id ?? `x-date-range-${auto}`;
  const [open, setOpen] = useState(defaultOpen);
  const [focused, setFocused] = useState(() => clampIso(value.start ?? today, min, max));
  const [view, setView] = useState(() => startOfMonth(clampIso(value.start ?? today, min, max)));
  const [pending, setPending] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<End, string | null>>({ start: null, end: null });
  const [bad, setBad] = useState<Record<End, boolean>>({ start: false, end: false });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const moveFocus = useRef(defaultOpen);

  useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [open, focused]);

  const show = (): void => {
    const f = clampIso(value.start ?? today, min, max);
    setFocused(f);
    setView(startOfMonth(f));
    setPending(null);
    setHover(null);
    moveFocus.current = true;
    setOpen(true);
  };
  const close = (): void => {
    setPending(null);
    setHover(null);
    setOpen(false);
  };
  const set = (range: DateRange): void => {
    onChange(range);
    setDraft({ start: null, end: null });
    setBad({ start: false, end: false });
  };
  const pickDay = (iso: string): void => {
    const r = pickRange(pending, iso);
    set(r.range);
    setFocused(iso);
    setPending(r.pending);
    if (r.done) close();
  };
  const commit = (which: End): void => {
    const text = draft[which];
    if (text === null) return;
    const iso = text.trim() === "" ? null : parseDateText(text, format);
    if (text.trim() !== "" && (!iso || isDayDisabled(iso, min, max, isDateDisabled))) {
      setBad((b) => ({ ...b, [which]: true }));
      return;
    }
    onChange(setRangeEnd(value, which, iso));
    setDraft((d) => ({ ...d, [which]: null }));
    setBad((b) => ({ ...b, [which]: false }));
  };
  const inputKey =
    (which: End) =>
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") commit(which);
      else if (e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        show();
      }
    };

  const invalid = !!error || bad.start || bad.end;
  const note = error ?? (bad.start || bad.end ? l.invalid : hint);
  const labelId = `${base}-label`;
  const noteId = note ? `${base}-note` : undefined;
  const shownEnd = value.end ?? (pending && hover ? hover : null);
  const todayOff = isDayDisabled(today, min, max, isDateDisabled);
  const sameRange = (r: DateRange): boolean => r.start === value.start && r.end === value.end;

  const input = (which: End): JSX.Element => (
    <input
      id={`${base}-${which}`}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={format}
      aria-label={l[which]}
      value={draft[which] ?? formatDate(value[which], format)}
      disabled={disabled}
      aria-invalid={bad[which] || error ? true : undefined}
      aria-describedby={noteId}
      onChange={(e) => {
        const text = e.target.value;
        setDraft((d) => ({ ...d, [which]: text }));
        setBad((b) => ({ ...b, [which]: false }));
      }}
      onBlur={() => commit(which)}
      onKeyDown={inputKey(which)}
    />
  );

  return (
    <div
      className={cx("ws-field x-date-picker x-date-range-picker", className)}
      role="group"
      aria-labelledby={labelId}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <label id={labelId} htmlFor={`${base}-start`}>
        {label}
      </label>
      <div className="x-date-control">
        {input("start")}
        <span className="x-date-range-sep" aria-hidden="true">
          –
        </span>
        {input("end")}
        <Popover
          open={open}
          onClose={close}
          placement="bottom-end"
          label={l.calendar}
          className="x-date-popover"
          trigger={(t) => <IconButton icon="calendar" label={l.openCalendar} disabled={disabled} onClick={() => (open ? close() : show())} {...t} />}
        >
          <div className="x-date-range-body">
            {presets?.length ? (
              <div className="x-calendar-presets" role="group" aria-label={l.presets}>
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="x-calendar-preset"
                    aria-pressed={sameRange(p.range)}
                    onClick={() => {
                      set(p.range);
                      close();
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : null}
            <Calendar
              view={view}
              months={2}
              focused={focused}
              today={today}
              locale={locale}
              weekStartsOn={weekStartsOn}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              range={{ start: value.start, end: shownEnd }}
              onFocusChange={(iso) => {
                moveFocus.current = true;
                setFocused(iso);
                setView((v) => keepInView(v, iso, 2));
                if (pending) setHover(iso);
              }}
              onMonthStep={(d) => {
                setView((v) => addMonths(v, d));
                setFocused((f) => clampIso(addMonths(f, d), min, max));
              }}
              onPick={pickDay}
              onHover={pending ? setHover : undefined}
              labels={l}
              idBase={`${base}-cal`}
              gridRef={gridRef}
            />
          </div>
          <div className="x-calendar-footer">
            <Button
              variant="secondary"
              disabled={!value.start && !value.end}
              onClick={() => {
                set({ start: null, end: null });
                setPending(null);
              }}
            >
              {l.clear}
            </Button>
            <Button variant="secondary" onClick={() => pickDay(today)} disabled={todayOff}>
              {l.today}
            </Button>
          </div>
        </Popover>
      </div>
      {note ? <small id={noteId}>{note}</small> : null}
    </div>
  );
}
