/** Line icons: 24 viewBox, stroke currentColor 1.75, round caps and joins, no fills.
 *  docs…terminal come from apps/desktop/src/components/ActivityBar.tsx; later names keep the path data of the
 *  inline svg they replace. Keys are lowercase, hyphen allowed (the AI manifest reads them with a regex). */
type Part = readonly ["path" | "circle" | "rect", Readonly<Record<string, string | number>>];

export const ICONS = {
  docs: [["path", { d: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" }], ["path", { d: "M14 3v5h5M9 13h6M9 17h6" }]],
  changes: [["circle", { cx: 6, cy: 6, r: 2 }], ["circle", { cx: 6, cy: 18, r: 2 }], ["circle", { cx: 18, cy: 8, r: 2 }], ["path", { d: "M6 8v8M18 10c0 4-4 4-10 6.5" }]],
  tasks: [["path", { d: "M10 6h10M10 12h10M10 18h10" }], ["path", { d: "m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17" }]],
  squads: [["circle", { cx: 9, cy: 8, r: 3.5 }], ["path", { d: "M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" }], ["path", { d: "M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.8 3.5 5.7" }]],
  agents: [["rect", { x: 5, y: 8, width: 14, height: 11, rx: 2 }], ["path", { d: "M12 8V4M10 4h4M3 12v3M21 12v3" }], ["circle", { cx: 9.5, cy: 13, r: 1 }], ["circle", { cx: 14.5, cy: 13, r: 1 }]],
  kit: [["path", { d: "M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" }], ["path", { d: "M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 13h16M11 13v2h2v-2" }]],
  accounts: [["circle", { cx: 12, cy: 8, r: 4 }], ["path", { d: "M4 21c0-4 3.6-7 8-7s8 3 8 7" }]],
  terminal: [["rect", { x: 3, y: 4, width: 18, height: 16, rx: 2 }], ["path", { d: "m7 9 3 3-3 3M13 15h4" }]],
  warn: [["path", { d: "M12 3 2 20h20z" }], ["path", { d: "M12 10v4M12 17h.01" }]],
  close: [["path", { d: "M6 6l12 12M18 6 6 18" }]],
  plus: [["path", { d: "M12 5v14M5 12h14" }]],
  search: [["circle", { cx: 11, cy: 11, r: 6 }], ["path", { d: "m20 20-4.5-4.5" }]],
  more: [["circle", { cx: 5, cy: 12, r: 1 }], ["circle", { cx: 12, cy: 12, r: 1 }], ["circle", { cx: 19, cy: 12, r: 1 }]],
  "chevron-left": [["path", { d: "M15 6l-6 6 6 6" }]],
  "chevron-right": [["path", { d: "M9 6l6 6-6 6" }]],
  magnifier: [["circle", { cx: 11, cy: 11, r: 7 }], ["path", { d: "m20 20-3.5-3.5" }]],
  prompt: [["path", { d: "m5 8 5 4-5 4M12 17h7" }]],
  folder: [["path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]],
  file: [["path", { d: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" }]],
  check: [["path", { d: "m5 12 5 5L20 7" }]],
  alert: [["path", { d: "M12 9v4M12 17h.01" }], ["path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" }]],
  "warn-dash": [["path", { d: "M12 3 2 20h20zM12 10v4M12 17v.5" }]],
  restore: [["path", { d: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" }]],
  history: [["path", { d: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" }]],
  bot: [["path", { d: "M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM12 8V4M10 4h4M9.5 13h.01M14.5 13h.01" }]],
  download: [["path", { d: "M12 4v11M7 10l5 5 5-5M5 20h14" }]],
  copy: [["path", { d: "M11 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM5 15V6a2 2 0 0 1 2-2h9" }]],
  plug: [["path", { d: "M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0zM12 16v5" }]],
  lock: [["path", { d: "M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3" }]],
  branch: [["circle", { cx: 6, cy: 5, r: 2 }], ["circle", { cx: 6, cy: 19, r: 2 }], ["circle", { cx: 18, cy: 7, r: 2 }], ["path", { d: "M6 7v10M18 9c0 5-6 4-12 8" }]],
  chevron: [["path", { d: "m6 9 6 6 6-6" }]],
  sliders: [["path", { d: "M4 7h9M17 7h3M4 17h3M11 17h9" }], ["circle", { cx: 15, cy: 7, r: 2 }], ["circle", { cx: 9, cy: 17, r: 2 }]],
  help: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", { d: "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" }]]
} as const satisfies Record<string, readonly Part[]>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
