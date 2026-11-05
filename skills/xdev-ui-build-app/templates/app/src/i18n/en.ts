// English strings. Keep one `key: "value",` per line; vi.ts must have the same keys.
export const en = {
  app: {
    name: "My app",
    notFoundTitle: "Page not found",
    notFoundHint: "The page you are looking for does not exist or was moved.",
    goHome: "Go to home",
    retry: "Try again",
    loadFailed: "Could not load this page",
    loadFailedHint: "Check your connection and try again.",
  },
  nav: {
    main: "Main",
    home: "Home",
    settings: "Settings",
  },
  home: {
    title: "Home",
    description: "Start here, then replace this page with your own.",
    emptyTitle: "No items yet",
    emptyHint: "Create the first item to see it here.",
    create: "Create item",
    created: "Item created.",
  },
  settings: {
    title: "Settings",
    description: "Preferences for this app.",
    theme: "Theme",
    themeHint: "System follows your device.",
    language: "Language",
    languageHint: "Applies to the whole app.",
  },
};

export type Dict = typeof en;
