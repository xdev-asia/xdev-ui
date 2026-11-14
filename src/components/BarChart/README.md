# BarChart

Bars that compare one measure across categories, with the value written beside each bar, for a breakdown such as usage by provider.

## Rules
- One measure, one hue (`--accent`); bars start at zero and have rounded ends only at the data end.
- `bars` are drawn in the given order; sort them (largest first) before passing them.
- `label` and every `valueLabel` are written by the consumer, already translated and formatted; the library ships no text.
- Horizontal (the default) suits long category names; use `orientation="vertical"` only for a few short ones.
- Each value is visible text and also the bar's tooltip, so colour and length are not the only carriers.
