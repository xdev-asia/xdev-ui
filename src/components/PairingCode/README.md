# PairingCode

Read-only display of a short code in large mono type, such as the pairing code a host shows or the six digits both screens must match.

## Anatomy
`div.x-pairing-code[role=group]` > `span.x-pairing-code-value[aria-live=polite]` (visually hidden full code + `.x-pairing-code-groups` > `.x-pairing-code-group`) + optional copy `IconButton`.

## Rules
- Show a code, not a password: it is meant to be read aloud or compared by eye, and it expires.
- Always pair it with a visible label or heading that says what the code is for; `label` names the group for screen readers.
- Groups are split by a visible gap, not by the separator character; `groupSize` is 5 by default and 3 for six digits.
- Screen readers read the groups as one string. A change of `value` is announced politely.
- `copyLabel` shows a copy `IconButton` and `onCopy` runs on click; the app writes the clipboard and confirms with a toast.
- `size` is `lg` (default) or `md`. Groups wrap at 360px.

## CSS classes
`.x-pairing-code`, `.x-pairing-code-value`, `.x-pairing-code-groups`, `.x-pairing-code-group`; `.x-pairing-code[data-size]`.
