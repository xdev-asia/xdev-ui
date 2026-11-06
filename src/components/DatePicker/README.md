# DatePicker

Text box for one calendar date, typed as `dd/mm/yyyy` or picked from a month calendar in a popover; the value is an ISO `YYYY-MM-DD` string.

## Anatomy
`div.ws-field.x-date-picker` > `label`, `div.x-date-control` (text `input` + calendar `IconButton` in a `Popover` `div.x-popover.x-date-popover[role=dialog]`), optional hidden `input[name]`, `small` hint or error. The panel holds `div.x-calendar` (month buttons, `h2.x-calendar-title`, `table.x-calendar-grid[role=grid]` of `td.x-calendar-day`) and `div.x-calendar-footer` (Clear, Today).

## Rules
- `value` and `onChange` use ISO `YYYY-MM-DD` or `null`, never a `Date`, so no time zone can shift the day. A malformed `value` shows an empty box.
- Typing: `format` (default `dd/mm/yyyy`) sets the field order; one-digit day and month and `/`, `-` or `.` separators are accepted. The text commits on blur or Enter; an impossible date (31/02), a day outside `min`/`max` or one `isDateDisabled` rejects keeps the text and shows `labels.invalid`. An empty box commits `null`.
- Calendar (WAI-ARIA date picker dialog): the button opens it, focus goes to the selected day (or today, kept inside `min`/`max`); arrows move a day or a week, Home and End go to the week's start and end, PageUp and PageDown a month, with Shift a year; Enter or Space picks and closes; Escape closes; focus returns to the button. Alt+ArrowDown in the box opens it too.
- One day holds `tabindex="0"` (roving). The value is `aria-selected`, today is `aria-current="date"`, days that cannot be picked are `aria-disabled` and have no click handler. Days of other months are blank cells.
- Month and weekday names come from `Intl.DateTimeFormat(locale)`; `weekStartsOn` (default 1, Monday) sets the first column.
- `today` defaults to the local date; pass it in SSR and tests so the markup is stable.
- `labels` (`DatePickerLabels`: `openCalendar`, `calendar`, `previousMonth`, `nextMonth`, `today`, `clear`, `invalid`) overrides the English defaults; ship `en` and `vi`.
- Use `DateRangePicker` for a start and end date, and `Field` for free text.
