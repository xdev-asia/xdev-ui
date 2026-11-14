# AuthShell

Frame for a sign-in, sign-up or password reset page: a showcase side with a headline, a tagline and art, next to a form pane with the brand, the language and theme controls, the form and a footer. From 1024px wide the two sit side by side; below that only the form pane shows.

## Anatomy

`div.x-auth` > `aside.x-auth-showcase` (`.x-auth-art` with `art` or the built-in `.x-auth-orbit`, then optional `.x-auth-pitch` > `p.x-auth-headline` + `p.x-auth-tagline`), then `div.x-auth-pane` > `header.x-auth-bar` (`.x-auth-brand` + optional `.x-auth-actions`), `main.x-auth-main` > `.x-auth-form` (children), optional `footer.x-auth-footer`.

## Rules

- Use it for pages a person sees before signing in. The account portal and legal pages use `SiteShell`; the app uses `AppShell`.
- `brand` is `BrandMark` with the product name; it shows once, in the form pane, on every width. Never recolour the mark.
- `actions` holds a language `Select` and a `ThemeSwitch` at most; no buttons in the bar.
- The form carries the page's only `h1` and its one primary `Button`, full width. The headline is a paragraph, not a heading.
- Headline and tagline are short, translated product lines; the showcase never holds a control or a link.
- `art` is the product's own picture or diagram. Leave it out for the built-in pattern; never use a stock illustration copied from another product.
- The footer holds the copyright and at most two plain links, in muted text.
- The built-in pattern stops moving under `prefers-reduced-motion`.
