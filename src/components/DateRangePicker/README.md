# DateRangePicker

Start and end date boxes with a two-month calendar in a popover, for filtering by a period; the value is `{ start, end }` as ISO `YYYY-MM-DD` strings.

## Anatomy
`div.ws-field.x-date-picker.x-date-range-picker[role=group]` > `label`, `div.x-date-control` (start `input`, `span.x-date-range-sep`, end `input`, calendar `IconButton` in a `Popover`), `small` hint or error. The panel holds `div.x-date-range-body` (optional `div.x-calendar-presets[role=group]` of `button.x-calendar-preset[aria-pressed]`, then `div.x-calendar[data-months="2"]`) and `div.x-calendar-footer` (Clear, Today).

## Rules
- `value` is `{ start: string | null; end: string | null }` in ISO; either end may be null while the user is choosing.
- In the calendar the first click sets the start (`{ start, end: null }`) and keeps it open; the second sets the end and closes. When the second day is earlier the ends swap. While the end is pending the days up to the pointer or the focused day are previewed.
- Typing into one box commits on blur or Enter like `DatePicker`; ends that cross are swapped. Each box has its own `aria-label` (`labels.start`, `labels.end`).
- Two months sit side by side on wide screens and stack when the popover is narrow. Keyboard moves follow `DatePicker` and scroll the view so the focused day stays visible.
- In-range days are an accent tint; the two ends are solid accent. Never a coloured stripe.
- `presets` (`{ label, range }[]`, "Last 7 days", "This month") are listed beside the calendar; the one that equals `value` is `aria-pressed`. Build preset ranges from the same `today` you pass in.
- `labels` (`DateRangePickerLabels`: `openCalendar`, `calendar`, `previousMonth`, `nextMonth`, `today`, `clear`, `start`, `end`, `presets`, `invalid`) overrides the English defaults; ship `en` and `vi`.
