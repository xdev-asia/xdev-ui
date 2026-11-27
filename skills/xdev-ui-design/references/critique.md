# Critique

Judge a screen against its brief and the xDev rules, then decide whether it is done. Use it at the end of a redesign or build, and on its own for "critique only". The audit (`xdev-ui-review`) finds rule breaks in code; this pass judges the result as a whole. Ideas adapted from tasteful-ui and ui-craft (MIT), in our own words.

## Contents
- Evidence first
- Scorecard
- Fail conditions
- Better than the original
- Findings table
- Convergence loop

## Evidence first

- Score what you saw. Take dark and light screenshots at 1440px and 375px before scoring the visual criteria; without screenshots, score only what the code shows and mark the rest `not seen`.
- Never write "looks good", "visually checked" or "matches the design" for anything you did not look at. Say which screenshots exist.
- Run the audit first (`xdev-ui-review`); a screen with audit errors is not ready for critique.

## Scorecard

Score each criterion 0 (fails), 1 (works with gaps) or 2 (clearly good). Write one line of evidence for every score below 2.

| # | criterion | 2 means |
|---|---|---|
| 1 | Main task | the brief's main task is the most visible path; the primary action is that task |
| 2 | Hierarchy | one thing reads first in each region; type roles and text colours step down cleanly |
| 3 | Grouping and rhythm | spacing grows from inside a group to between sections; few boxes |
| 4 | Density | matches the brief: compact for daily work, roomier for rare setup |
| 5 | States | empty, loading, error, no permission and partial data are designed, not defaults |
| 6 | xDev identity | tokens only, one accent, hairlines not shadows, `BrandMark` in the shell, no anti-generic item (`direction.md#anti-generic-list`) |
| 7 | Language | verbs on actions, sentence case, the product's terms, `en` and `vi` both fit |
| 8 | Motion and feel | moves only with a cause, within the motion budget, hover by ground colour |
| 9 | Small screen | works at 360px without sideways scroll; the main task still comes first |

Total out of 18. Done means 15 or more, no 0, and no fail condition.

## Fail conditions

Any one of these fails the screen whatever the total:

- An audit error is left, or contrast fails.
- A preserve-list item was broken without the person's agreement.
- An invented number, chart or activity is shown as real data.
- More than one primary action on a surface.
- A state is missing: the region goes blank on error or on no data.
- The screen ignores the chosen direction (the craft read no longer describes it).

## Better than the original

For a redesign, compare with the screen you started from, task by task: for each main task in the brief, is it fewer steps, easier to find, or clearer to read? Write "better", "same" or "worse" with one reason each. If no task is better, the redesign has not earned its cost; say so instead of shipping it.

## Findings table

Report findings from the critique, most severe first:

```markdown
| severity | where | before | after | why |
|---|---|---|---|---|
| Critical | Runs list, row actions | three equal buttons per row | one primary on the detail pane, row menu for the rest | `int-one-primary`; the main task is approve |
| High | Empty runs | blank table | `EmptyState` with "Create a run" | `craft-empty-teaches` |
| Quick win | Page header | description repeats the title | count of runs | `nav-count-heading` |
```

- **Critical**: a fail condition, an accessibility failure, or a broken main task.
- **High**: a score of 0, or a problem every visit meets.
- **Quick win**: a small change with a clear gain; do these in the same round.

Every row cites a rule ID, a craft ID, a brief line or a screenshot. A row with no citation is an opinion; drop it or ask.

## Convergence loop

1. Fix the Critical and High rows and the quick wins.
2. Re-run the audit, retake the screenshots, score again.
3. Stop when the screen is done (see the scorecard), or after three rounds. After three rounds, report what is left and why instead of going on.
4. When a problem came back in a second round, or the person corrected a choice, add one line to "Decisions and learned constraints" in the app's `DESIGN.md` (`brief-template.md`).
