# Visual identity

A screen can pass every rule of the design system and still look unfinished: grey initials on every card, content from edge to edge, nothing that tells one thing from the next. This page is what to add after the layout and the states are right.

## Contents
- A face for each thing
- One width, one rhythm
- Colour
- Look before you call it done
- What goes wrong

## A face for each thing
Where many things of one kind sit side by side (providers, integrations, tools, apps), each leads with an `Emblem`, inside a `ResourceCard` or a `ListRow`.

```tsx
<Grid minItemWidth="15rem" gap={3}>
  {providers.map((p) => (
    <ResourceCard
      key={p.id}
      href={`#/providers/${p.id}`}
      leading={<Emblem name={p.name} src={logoOf(p.id)} text={p.mark} color={p.color} />}
      title={p.name}
      status={<StatusDot tone="ok" label={t("providers.connected", { n })} />}
      trailing={<Switch aria-label={t("providers.use", { name: p.name })} checked={on} onChange={toggle} />}
      revealTrailing="hover"
    />
  ))}
</Grid>
```

- **Logo first.** If the thing has a logo and you may use it, ship the file and pass `src`. It sits on a white plate in both themes.
- **Else its letters on its colour.** `text` (one to three letters) and `color` come from the data, next to the name. Without them `Emblem` shows the initials on the accent.
- **Never the same grey circle for everything.** `Avatar` is for people.
- A third party's logo names that party and nothing else: keep its shape and colours, and say where the files came from.

## One width, one rhythm
- Every page sits in one `Container` (`xl` for lists and dashboards, `md` for forms). Content that runs to the screen edge on a wide monitor reads as unfinished.
- Above each grid: a heading and how many things it holds. A grid of 40 cards with no heading is a wall.
- A header control is as wide as its content. A `Segmented` or `Tabs` stretched across the page is a layout bug.

## Colour
- The accent marks what to do next (the primary button, the current nav item). A thing's own colour lives in its `Emblem` and nowhere else.
- State is said in words beside a `StatusDot`. A card does not change colour with its state; a switched-off thing is `dimmed`.

## Look before you call it done
Tests and the audit do not see ugliness. Before saying a screen is done, open it and take a screenshot:

1. dark and light;
2. 1440px wide and 360px wide;
3. with real amounts of data (5 rows and 50), not only the empty state.

If there is a reference (an existing product, a mock-up), put the two pictures side by side and list what differs.

## What goes wrong

| what you see | cause | fix |
|---|---|---|
| Every card has the same grey circle with letters | `Avatar` used for things | `Emblem` with `src`, or `text` and `color` |
| Letters are cut off or the brand logo changed size | a class of your own named like a library class (`.x-mark`) | prefix app classes with the app, never `x-` |
| Content touches both screen edges at 1440px | no `Container` | wrap the page |
| A logo vanishes in dark mode | logo drawn on the page colour | pass it as `Emblem src` |
| The page passes the audit and still looks flat | nobody looked at it | the screenshots above |
