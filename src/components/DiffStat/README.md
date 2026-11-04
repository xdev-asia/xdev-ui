# DiffStat

Mono `+added −removed` line count for a change, a file or a session row.

## Rules
- Added in `--ok`, removed in `--danger`, 10px mono.
- Show both numbers even when one is zero, so rows align.
- The minus is U+2212, not a hyphen.
- `labels` (`DiffStatLabels`: `diffStat(added, removed)`) overrides the accessible English summary.
