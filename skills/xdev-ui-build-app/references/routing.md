# Routing

The template uses `location.hash`, so it needs no router package and works on any static host.

```ts
export function matchRoute(hash: string): RouteName   // pure, tested
export function useRoute(): RouteName                 // useSyncExternalStore on hashchange
export function navigate(to: string): void
```

- Link with a plain `<a href="#/settings">` or a `NavList` item `href`.
- `useRoute` returns `home` on the server, so server rendering and tests work.
- Unknown paths render the not-found page, which offers one way back.
- Swap in another router when the app needs nested layouts or data loading; keep `matchRoute`-style pure functions so routes stay testable.
