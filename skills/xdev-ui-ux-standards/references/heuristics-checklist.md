# Heuristics checklist

The reviewer's list for one screen or flow, in the running app. Each heuristic from https://www.nngroup.com/articles/ten-usability-heuristics/ becomes checks you can answer yes or no. Rule IDs point to the standards map. Mark each item pass, fail or not run; never mark an item you did not run.

## Contents
- Setup
- 1. Visibility of system status
- 2. Match with the real world
- 3. User control and freedom
- 4. Consistency and standards
- 5. Error prevention
- 6. Recognition rather than recall
- 7. Flexibility and efficiency
- 8. Aesthetic and minimalist design
- 9. Recognize, diagnose and recover from errors
- 10. Help and documentation
- Accessibility pass

## Setup

- Run `xdev-ui-review` first; its errors are fixed.
- Test in dark and light, in `en` and `vi`, at full width and at 320px wide.
- Have a keyboard, a pointer, and on one platform a screen reader (VoiceOver, Narrator or Orca).

## 1. Visibility of system status

"The design should always keep users informed about what is going on, through appropriate feedback."

- [ ] Every action the user starts shows a result within the region it changed (row updated, toast, status bar).
- [ ] Background work shows a status bar item with progress; a notification only when attention is needed, with Cancel (V2).
- [ ] Loading, empty, error and done are designed for every region (one `Spinner` per region).
- [ ] The current view, tab, branch and pane are marked (`aria-current` or `aria-selected`), not by colour alone (C5).
- [ ] Status text reaches screen readers through a live region (N3, N4).

## 2. Match with the real world

"The design should speak the users' language."

- [ ] Labels use the words of the domain (branch, commit, worktree, session), not internal names or error codes.
- [ ] Icons are clear metaphors; an icon without a common meaning has a text label (V4, V6).
- [ ] Dates and numbers use the active locale.

## 3. User control and freedom

Users "need a clearly marked emergency exit".

- [ ] Esc closes every overlay and returns focus to its trigger (K7).
- [ ] Destructive actions can be undone or are confirmed first (E4).
- [ ] Long jobs can be cancelled.
- [ ] Focus can leave every terminal and editor pane with F6 (K2).

## 4. Consistency and standards

"Users should not have to wonder whether different words, situations, or actions mean the same thing."

- [ ] One name and one icon per action across the app (B4).
- [ ] Navigation keeps its order across views (B3).
- [ ] Dialogs put Cancel first and the primary last; one primary per surface (platforms).
- [ ] Sentence case in every label; no emoji; no exclamation marks.
- [ ] Standard shortcuts keep their platform meaning; no shortcut is overridden (K8, V5).
- [ ] Each widget follows its APG pattern from the patterns file.

## 5. Error prevention

"The best designs carefully prevent problems from occurring in the first place."

- [ ] Inputs constrain values (select, picker, numeric field) where possible.
- [ ] Save stays disabled until something changed; the reason for a disabled control is written next to it.
- [ ] Destructive confirms name the object and repeat the verb; nothing destructive is the Enter default.
- [ ] Changing a setting does not move focus or open a window without warning (B2).

## 6. Recognition rather than recall

"Minimize the user's memory load by making elements, actions, and options visible."

- [ ] Every shortcut is shown in its menu item, tooltip or command palette row.
- [ ] Pickers show recent and current values; a pick list offers "Create new" when it applies (V6).
- [ ] Multi-step flows carry earlier values forward (E5).

## 7. Flexibility and efficiency

"Shortcuts, hidden from novice users, may speed up the interaction for the expert user."

- [ ] Frequent actions have a shortcut and a command palette entry; the palette groups commands by category (V5).
- [ ] Lists support typeahead where the pattern asks for it (listbox over 7 options, tree).
- [ ] Every pointer gesture (drag to resize, reorder, pan) has a keyboard path (K1).

## 8. Aesthetic and minimalist design

"Interfaces should not contain information that is irrelevant or rarely needed."

- [ ] One accent marks the current thing; state is a tint, a 1px border or a `StatusDot`.
- [ ] A view has few actions per row (three at most) and few views per sidebar (V7).
- [ ] Empty states are short, with one action and specific link text (V8).
- [ ] No notification for promotion or for messages that need no action (V1, V3).

## 9. Recognize, diagnose and recover from errors

"Error messages should be expressed in plain language (no error codes), precisely indicate the problem."

- [ ] Field errors name the field and say what is wrong in text (E1).
- [ ] When the fix is known, the message suggests it (E3).
- [ ] A failed load shows a `Banner` with a retry action; the user's input is kept.
- [ ] Technical detail (exit code, log) is one step away, not the headline.

## 10. Help and documentation

"It's best if the system doesn't need any additional explanation."

- [ ] Complicated settings link to their documentation (V10).
- [ ] Help and About keep one place in the menu (B5).
- [ ] The keyboard shortcut list is reachable from the menu and the palette.

## Accessibility pass

- [ ] Tab through the screen: order follows reading order, no positive `tabIndex`, focus ring visible on every stop (K3, K4).
- [ ] The focused control is never fully covered by a sticky header, the status bar or a toast (K5).
- [ ] Every control has a name; icon-only controls use `IconButton` `label` (N1, N2).
- [ ] Pointer targets are 24px or have 24px of clear space; check tab close, search clear and swatches (P1).
- [ ] Text spacing override (1.5, 2, 0.12, 0.16) clips nothing (L1).
- [ ] Turn on reduced motion: nothing slides, scales or spins except progress (M1, M2).
- [ ] On Windows, turn on a contrast theme: focus rings, selected rows, field edges and icons stay visible (M5, M6).
- [ ] Tooltips and popovers close on Esc and stay while hovered (L3).
- [ ] Toasts that hide by themselves repeat information available elsewhere (B6).
