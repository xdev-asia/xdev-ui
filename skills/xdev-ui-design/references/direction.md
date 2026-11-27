# Direction before pixels

Decide what a screen should *feel* like before you place parts. The library fixes the look (tokens, brand, one accent); what is still open is density, layout, the order of information and what gets the emphasis. This file is how to choose those on purpose instead of by default.

Ideas adapted, in our own words, from ui-craft (educlopez, MIT) and tasteful-ui (DonkeyKing01, MIT); the precedence idea from open-design-skill (MIT). xDev rules win wherever they differ.

## Contents
- Modes
- When the gates apply
- Gate 1: understand the project
- Gate 2: choose a direction
- Gate 3: write the brief
- Craft read
- Precedence
- Anti-generic list

## Modes

| mode | when | output |
|---|---|---|
| **redesign** (default for "make it better", "redo this screen") | an existing screen or app whose look or structure is the problem | the three gates, then the build, then [critique](critique.md) |
| **build** | a new screen whose brief already exists (the app's `DESIGN.md`, a ticket with a picture) | read the brief, build, critique |
| **critique only** | "review", "what is wrong with this", no code wanted | the [critique](critique.md) table; no edits |

Say which mode you picked in the first line of your reply.

## When the gates apply

- **Apply** for a new app, a new screen type, a redesign that touches more than one region, or a port.
- **Skip** for one fix (a colour, a label, a spacing slip, an audit finding): go straight to the rules. Polishing an existing screen without changing its structure belongs to `xdev-ui-improve`.
- Each gate ends your turn and waits for the person's answer, unless they said "just do it" or the brief already answers the gate. Then state what you assumed and go on.

## Gate 1: understand the project

Read before you propose anything: the app's `DESIGN.md` or `AGENTS.md`, the router or nav, the screen in question, and its siblings. Then write, in a few lines each:

- **Product**: what it is and who pays for it.
- **People**: who uses the screen, how often, on what device, with what expertise.
- **Main task**: the one job the screen exists for, as a verb ("approve a run", "find a failed job").
- **Constraints**: data volume, permissions, languages (`en` and `vi`), what is already shipped and must not move.
- **Preserve list**: things that work and stay. Information order people learned, keyboard paths, URLs, names, a layout the owner measured (see [owner's notes](owner-notes.md)). A redesign that breaks one of these needs the person's say-so.

End with one open question if something blocks the next gate; otherwise end with the gate 2 proposal.

## Gate 2: choose a direction

Offer one to three directions, each inside xDev. A direction may change:

- **density**: compact rows (`--h-row`) and a toolbar, or roomier cards;
- **layout pattern**: list with detail pane, table, board, grid of cards, single form;
- **information order**: what is first, what is one click away, what is hidden;
- **emphasis**: which single thing carries the accent and the largest type role.

A direction may **not** change tokens, faces, the accent, the brand mark, radius language or the shadow rule. If a direction seems to need that, the change belongs in xdev-ui itself and is a separate decision.

For each direction write: a name of two or three words, one sentence on what it optimises for, the main parts it uses (`DataTable`, `ResourceCard`, `Board`...), what it gives up, and which person it suits. Recommend one.

## Gate 3: write the brief

Write or update the app's `DESIGN.md` from the [brief template](brief-template.md) with the chosen direction, the preserve list and the screens it covers. The brief is the contract: the build follows it, the critique scores against it, and decisions learned later go back into it.

## Craft read

Before the build, write one sentence that states the direction in working terms, for example: "Dense list-detail for on-call engineers; status first, actions on the row, no cards." Keep it at the top of the brief. When a later choice does not fit the sentence, the choice is wrong or the sentence needs to change, and you say which.

## Precedence

When two sources disagree, the higher one wins:

1. The owner's notes ([owner-notes](owner-notes.md)).
2. Tokens and brand ([tokens](tokens.md), [brand](brand.md)).
3. The rule catalogue ([rules](rules.md)) and component `## Rules`.
4. The app's `DESIGN.md` brief, for choices the rules leave open.
5. Craft guidance ([craft](craft.md)).
6. Templates and recipes ([screens](screens.md), the `xdev-ui-admin` references).

## Anti-generic list

Each of these makes a screen look like every other generated UI. Treat one as a finding unless the brief gives a reason.

- A marketing hero (big headline, illustration, call to action) on a tool screen. Tools open on the work.
- Gradient blobs, glows, glass panels or decorative noise behind content.
- A grid of cards that exists to fill space: four tiles with an icon and two words each.
- Invented numbers, sample charts or fake activity shown as if real. Empty data gets an `EmptyState`.
- Vague words in copy or in the brief: "modern", "clean", "sleek", "beautiful". Name what is better and for whom.
- Another product's look copied: its colours, logo shapes or signature layout. A port keeps the layout and information order, never the brand.
- A dark dashboard chosen by habit. xDev is dark first for its own chrome, but the screen type (a long form, a document) decides the pattern, not a wish to look technical.
- Every region boxed in a card. Use hairlines and spacing; a card is for a thing you can open or select.
- Icons on every label, and decorative icons that repeat the text.
- Centred layouts for working screens; a working screen aligns to the start edge.
- Uppercase, letter-spaced labels everywhere. Uppercase is only `--type-section`.
- More than one primary action, or the accent spent on decoration.
