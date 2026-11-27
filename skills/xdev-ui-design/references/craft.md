# Craft

Rules of thumb that the token set and the [rule catalogue](rules.md) leave open: how to use the scale well, not which values exist. They rank below the rules ([precedence](direction.md#precedence)); where a common craft number disagrees with xDev, the xDev value is the one written here. Ideas adapted from ui-craft (MIT), in our own words.

## Contents
- Reading and type
- Space and grouping
- Motion
- Actions and choices
- States

## Reading and type

| ID | do | why | check |
|---|---|---|---|
| `craft-measure` | prose lines 45 to 75 characters; cap long text blocks with `max-inline-size` in `ch` (about `70ch`), not by the container | long lines lose the next line's start | read a description at 1440px |
| `craft-hierarchy-roles` | build hierarchy with the existing roles and weight (page title, heading, body, label, status) and with `--text-1` / `--text-2` / `--text-3`; never add a size | the scale stays small enough to mean something | count distinct type roles in one card: three or fewer |
| `craft-one-loud-thing` | each region has one element that reads first; the rest step down | two loud things cancel out | squint at a screenshot |
| `craft-numbers-align` | numbers that are compared sit in one column, mono, right-aligned | the eye compares down, not across | read a numeric column |

## Space and grouping

| ID | do | why | check |
|---|---|---|---|
| `craft-space-rhythm` | space inside a group < between groups < between sections; for example `--x-space-2` inside a field group, `--x-space-4` between groups, `--x-space-6` or `--x-space-8` between sections | spacing is how people see what belongs together | the gaps grow outward, never the same everywhere |
| `craft-group-by-space` | separate with space or a 1px `--line` before reaching for a card or a box | boxes add weight and nesting | count nested borders: at most two |
| `craft-density-by-frequency` | screens used all day are compact (`--h-row` rows, a toolbar); screens used once (setup, onboarding) can breathe | experts want more on screen, newcomers want fewer choices | match the brief's density line |
| `craft-align-start` | working content aligns to one start edge; centre only empty states and sign-in | ragged starts look accidental | draw a line down the left edge |

## Motion

xDev's budget is in `xdev-ui-motion`: `transform` and `opacity`, 120 to 200ms, `ease` or `ease-out`, no invented curves. These rules decide *when* to move inside that budget.

| ID | do | why | check |
|---|---|---|---|
| `craft-frequency` | the more often a thing happens, the less it moves; actions done from the keyboard (palette, shortcuts, arrow keys) do not animate | repeated motion turns into waiting | count how often the transition plays in a working hour |
| `craft-exit-shorter` | an exit is shorter than its entrance or instant; a 180ms drawer leaves in about 120ms or at once | people want gone things gone | time open and close |
| `craft-no-stagger-repeat` | no staggered entrance on lists, tables or grids the person returns to; content appears together | a cascade on every visit is a delay | reload a list twice |
| `craft-hover-no-scale` | hover changes the ground to `--bg-3` or shows a hairline; it never scales, lifts or adds a shadow | a scaled row shifts its neighbours' text | hover a card and a row |
| `craft-motion-has-cause` | every motion answers a person's action or a state change they need to notice; no ambient loops (except the working `StatusDot`) | motion without a cause steals attention | list each animation and its trigger |

## Actions and choices

| ID | do | why | check |
|---|---|---|---|
| `craft-friction-by-reach` | match friction to what a mistake would cost. One item that can be restored: act at once and offer undo in a `Toast`. One item lost for good: a `Dialog` that names it. Many items, shared data or a whole workspace: the `Dialog` asks the person to type the name | the same confirm everywhere trains people to click through it | list each destructive action with its reach and its friction |
| `craft-few-choices-visible` | five options or fewer, picked often: `Segmented` (one-line, view or mode) or `RadioGroup` (a setting with descriptions) instead of a `Select` | a hidden list costs a click and hides the choice | count the options of each `Select` |
| `craft-dialog-exits` | every `Dialog` closes by Escape, by its close button and by a secondary action; the primary button names the outcome with a verb ("Delete provider", not "OK") | people must never feel trapped, and must know what the button does | press Escape; read the buttons |
| `craft-primary-is-the-task` | the one primary action is the screen's main task from the brief, not the easiest action to place | the accent points at what matters | compare the primary with the brief's main task |

## States

| ID | do | why | check |
|---|---|---|---|
| `craft-unhappy-first` | design the error, empty, no-permission and partial-data states before the full one | the full state is the easiest and the least seen at first use | the brief's states section is filled before the build |
| `craft-empty-teaches` | an `EmptyState` says what will appear here and offers the one action that makes it appear | the first visit is a lesson | clear the data |
| `craft-loading-keeps-shape` | loading keeps the layout with `Skeleton` or a region `Spinner`, so nothing jumps when data lands | layout shift loses the reader's place | throttle and watch the page settle |
