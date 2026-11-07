One agent profile as a card: a collapsed summary (name, command, model, account) that opens into the profile form.

## Anatomy
`article.x-agent-row[data-expanded]` > `div.x-agent-row-head` (`button.x-agent-row-toggle` with chevron, name, `code` command and summary; `.x-agent-row-actions`) + `div.x-agent-row-body[role=region][hidden]`.

## Rules
- Use it for a list of agent profiles on a settings page. One row per profile; the page has one primary action ("Add profile"), the rows have none.
- `expanded` is controlled. Keep at most one row open: the list holds the open id and passes `expanded={id === open}`. Collapsed is the default.
- The toggle is one button with `aria-expanded` and `aria-controls`; Enter and Space work. The chevron is decoration. The body is a `region` named by `labels.details(name)` and is `hidden` while collapsed, so its fields are not focusable.
- Put model and account in `summary` as short text so the collapsed row still says what the profile does. Do not show status by colour alone.
- `actions` sit outside the toggle button, so a click on Duplicate or Remove does not open the row. Make them `IconButton`s or secondary or ghost `Button`s.
- State is a tint and a 1px border (open row). Never a coloured left stripe.
- `labels.details` translates the region name. The component has no other strings.
- Below 600px the summary wraps under the name; the row works at 360px.
