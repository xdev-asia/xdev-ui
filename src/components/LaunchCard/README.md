# LaunchCard

Card that starts an agent: pick the agent, the worktree and the model, write the task, and press Start. Extra fields live in a closed "More options" disclosure.

## Anatomy
`section.x-launch` > `Segmented` (agent) + `.x-launch-row` (`Select` worktree, `Select` model) + `textarea.kit-textarea` (task) + `.x-launch-chips` (`Tag` of the chosen worktree and model) + `Disclosure` (`advanced`) + `.x-launch-foot` (`Button`).

## Props
`agents`, `worktrees`, `models` (each `{ value, label }[]`), `value: { agent, worktree, model, prompt }`, `onChange(value)`, `onStart()`, `advanced?: ReactNode`, `labels?` (`region`, `agent`, `worktree`, `model`, `prompt`, `promptPlaceholder`, `more`, `start`).

## Rules
- Start is the one primary button of the card.
- The card is controlled: `onChange` receives the whole next `value`.
- The chips repeat the chosen worktree and model so they stay visible while the disclosure and the text area change the layout; they are not controls.
- `advanced` renders inside a disclosure that starts closed; without it, no disclosure renders.
- Every select and the text area has a visible label. Keep labels to one word.
- The caller decides when Start is allowed (for example, an empty task); validate in `onStart` and show a message in the page.
- Translate with `labels`; the defaults are English.
