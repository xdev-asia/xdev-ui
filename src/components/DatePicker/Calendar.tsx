import type { JSX, KeyboardEvent, Ref } from "react";
import { addDays, addMonths, clampIso, dayLabel, gridKey, isDayDisabled, monthGrid, monthTitle, parseIso, startOfMonth, weekdayNames, type WeekDay } from "../../internal/date";
import { IconButton } from "../IconButton/IconButton";

/** Shared by DatePicker and DateRangePicker; not exported from the package. */
export interface CalendarProps {
  /** Any day in the first month shown. */
  view: string;
  months: 1 | 2;
  /** The day that holds the roving tabindex. */
  focused: string;
  today: string;
  locale: string;
  weekStartsOn: WeekDay;
  min?: string | null;
  max?: string | null;
  isDateDisabled?: (iso: string) => boolean;
  /** Range ends and the days between them; a single date is a range whose ends meet. */
  range: { start: string | null; end: string | null };
  onFocusChange: (iso: string) => void;
  /** ±1: the previous or next month button. */
  onMonthStep: (delta: 1 | -1) => void;
  onPick: (iso: string) => void;
  onHover?: (iso: string | null) => void;
  labels: { previousMonth: string; nextMonth: string };
  idBase: string;
  gridRef?: Ref<HTMLDivElement>;
}

export type CalendarKeyResult = { move: string } | { pick: string } | null;

/** What a key in the grid does: move the focused day (kept inside min and max) or pick it. Pure. */
export function calendarKey(
  key: string,
  focused: string,
  opts: { shiftKey?: boolean; weekStartsOn?: WeekDay; min?: string | null; max?: string | null; isDateDisabled?: (iso: string) => boolean },
): CalendarKeyResult {
  if (key === "Enter" || key === " ") return isDayDisabled(focused, opts.min, opts.max, opts.isDateDisabled) ? null : { pick: focused };
  const next = gridKey(key, focused, opts);
  return next === null ? null : { move: clampIso(next, opts.min, opts.max) };
}

/** Whether the previous / next month buttons can move, given min and max. */
export function monthStepAllowed(view: string, months: number, min?: string | null, max?: string | null): { prev: boolean; next: boolean } {
  const first = startOfMonth(view);
  return { prev: !min || addDays(first, -1) >= min, next: !max || addMonths(first, months) <= max };
}

export function Calendar(p: CalendarProps): JSX.Element {
  const first = startOfMonth(p.view);
  const shown = Array.from({ length: p.months }, (_, i) => parseIso(addMonths(first, i))!);
  const names = weekdayNames(p.locale, p.weekStartsOn);
  const step = monthStepAllowed(first, p.months, p.min, p.max);
  const { start, end } = p.range;
  const lo = start && end && end < start ? end : start;
  const hi = start && end && end < start ? start : end;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const r = calendarKey(e.key, p.focused, { shiftKey: e.shiftKey, weekStartsOn: p.weekStartsOn, min: p.min, max: p.max, isDateDisabled: p.isDateDisabled });
    if (!r) return;
    e.preventDefault();
    if ("pick" in r) p.onPick(r.pick);
    else p.onFocusChange(r.move);
  };

  return (
    <div className="x-calendar" data-months={p.months}>
      <div className="x-calendar-nav">
        <IconButton icon="chevron-left" label={p.labels.previousMonth} disabled={!step.prev} onClick={() => p.onMonthStep(-1)} />
        <IconButton icon="chevron-right" label={p.labels.nextMonth} disabled={!step.next} onClick={() => p.onMonthStep(1)} />
      </div>
      <div className="x-calendar-months" ref={p.gridRef} onKeyDown={onKeyDown} onMouseLeave={p.onHover ? () => p.onHover?.(null) : undefined}>
        {shown.map(({ y, m }) => {
          const titleId = `${p.idBase}-${y}-${m}`;
          return (
            <div className="x-calendar-month" key={titleId}>
              <h2 className="x-calendar-title" id={titleId} aria-live="polite">
                {monthTitle(y, m, p.locale)}
              </h2>
              <table className="x-calendar-grid" role="grid" aria-labelledby={titleId}>
                <thead>
                  <tr>
                    {names.map((n) => (
                      <th key={n.long} scope="col" abbr={n.long}>
                        {n.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthGrid(y, m, p.weekStartsOn).map((week) => (
                    <tr key={week[0]}>
                      {week.map((iso) => {
                        if (parseIso(iso)!.m !== m) return <td key={iso} className="x-calendar-day" data-outside="" />;
                        const off = isDayDisabled(iso, p.min, p.max, p.isDateDisabled);
                        const isStart = iso === lo;
                        const isEnd = iso === hi;
                        const middle = !!lo && !!hi && iso > lo && iso < hi;
                        const selected = isStart || isEnd || middle;
                        return (
                          <td
                            key={iso}
                            className="x-calendar-day"
                            tabIndex={iso === p.focused ? 0 : -1}
                            aria-selected={selected}
                            aria-current={iso === p.today ? "date" : undefined}
                            aria-disabled={off ? true : undefined}
                            aria-label={dayLabel(iso, p.locale)}
                            data-iso={iso}
                            data-range={lo !== hi && selected ? (isStart ? "start" : isEnd ? "end" : "middle") : undefined}
                            onClick={off ? undefined : () => p.onPick(iso)}
                            onMouseEnter={p.onHover && !off ? () => p.onHover?.(iso) : undefined}
                          >
                            {parseIso(iso)!.d}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
