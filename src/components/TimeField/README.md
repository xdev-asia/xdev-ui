# TimeField

Typed text box for a time of day (`HH:mm`, `HH:mm:ss`) or a short duration (`mm:ss`), with no popover; the value is a normalised string.

## Anatomy
`div.ws-field.x-time-field` > `label[for]` (`.x-sr-only` with `hideLabel`), text `input` in the mono face, optional hidden `input[name]` with the committed value, `small` hint or error linked by `aria-describedby`. The wrapper takes `data-invalid` and `data-disabled`.

## Rules
- `value` and `onChange` use the normalised string or `null` (empty box), never a `Date` or a number. A `value` that does not parse in the current mode shows an empty box.
- `mode="time"` (default): 00:00 to 23:59, with `seconds` 00:00:00 to 23:59:59. `mode="duration"`: minutes 0 to `maxMinutes` (default 59; above 99 the minutes take more digits) and seconds 0 to 59. The placeholder shows the pattern: `hh:mm`, `hh:mm:ss` or `mm:ss`.
- While typing the text stays as typed; it commits on blur or Enter. Fields are split by `:` or `.`, each one or two digits: `9:5` becomes `09:05`, `1:02:03` becomes `01:02:03` with `seconds`. With `seconds`, `09:30` becomes `09:30:00`; without it a seconds field is invalid.
- Digits only: time mode reads 1–2 digits as hours (`9` → `09:00`), 3–4 as hours then the last two as minutes (`930`, `0930` → `09:30`), and with `seconds` 5–6 as hours, minutes, seconds. Duration mode reads 1–2 digits as seconds (`45` → `00:45`; `90` is invalid) and 3 or more as minutes then the last two as seconds (`130` → `01:30`).
- An emptied box commits `null`. Unparseable or out-of-range text stays in the box, shows `labels.invalid` as the error line and does not call `onChange`; an explicit `error` prop wins over it.
- ArrowUp and ArrowDown step by one minute (time) or one second (duration), wrapping inside the range, and commit at once. They step from valid typed text, else from `value`, else from 00:00.
- A new `value` from outside replaces any pending text and clears the invalid message.
- `labels` (`TimeFieldLabels`: `invalid`) overrides the English default; pass translated strings from the app.
- The pure helpers `parseTime`, `formatTime`, `stepTime` and `timeToSeconds` take the same `mode`, `seconds` and `maxMinutes` options; use them to validate on the server or to compute totals.
- Use `DatePicker` for a calendar date, and `Field` for free text.
