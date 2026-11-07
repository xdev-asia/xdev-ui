# ApprovalBar

Bar that asks the user to allow or deny one action of an agent, with the command it is about. It takes focus when it appears and announces itself.

## Anatomy
`div.x-approval[role=group]` > `.x-approval-text[role=status]` (`.x-approval-title` + `code.x-approval-command`) + `.x-approval-actions` (Allow, Always allow, Deny).

## Props
`title`, `command?`, `onAllow`, `onAlways?`, `onDeny`, `busy?`, `labels?` (`region`, `allow`, `always`, `deny`).

## Rules
- Allow is the one primary button, Always allow is secondary, Deny is ghost.
- Focus moves to the group when it mounts, so keyboard users reach the buttons with Tab. Mount it only when a request exists; unmount it after the answer.
- The text sits in a live region (`role="status"`) so a screen reader announces the request.
- `Always allow` renders only when `onAlways` is given.
- `busy` disables all three buttons while the answer is sent.
- Show the exact command in `command`; never a summary of it.
- Translate with `labels`; the defaults are English.
