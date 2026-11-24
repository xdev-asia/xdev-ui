import palette from "./palette.json";
import type { Prefs, Preset } from "./prefs";

/**
 * Ant Design's base colours (the 6th step of each palette), as react-antd-admin's built-in themes, and the two text
 * colours used on an accent. They are values people pick, not styling, so they live in palette.json as data.
 */
export const PRESET_COLORS: Record<Exclude<Preset, "default" | "custom">, string> = palette.presets;

/** Pure: the accent colour a preset sets, or null for the xDev default. */
export function accentOf(prefs: Pick<Prefs, "preset" | "customColor">): string | null {
  if (prefs.preset === "default") return null;
  if (prefs.preset === "custom") return prefs.customColor;
  return PRESET_COLORS[prefs.preset];
}

const channel = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
/** Pure: WCAG relative luminance of `#rrggbb`. */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
const contrast = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
/** Pure: white text on the accent when it reaches 3:1 (WCAG's large-text and UI threshold), as Ant Design's presets use; near-black otherwise (gold, lime, green, cyan). */
export function onAccent(hex: string): string {
  return contrast(luminance(hex), 1) >= 3 ? palette.onAccent.light : palette.onAccent.dark;
}

/** CSS custom properties the preferences set on <html>, so every part follows. */
export const ROOT_VARS = [
  "--accent",
  "--x-color-accent",
  "--x-color-on-accent",
  "--x-color-accent-soft",
  "--radius-s",
  "--radius-m",
  "--radius-l",
  "--x-radius-sm",
  "--x-radius-md",
  "--x-radius-lg",
  "--w-side",
  "--w-rail",
] as const;

/** Pure: the custom properties and the filter for the preferences. A var left out keeps the stylesheet's value. */
export function rootStyle(prefs: Prefs): { vars: Partial<Record<(typeof ROOT_VARS)[number], string>>; filter: string } {
  const vars: Partial<Record<(typeof ROOT_VARS)[number], string>> = {};
  const accent = accentOf(prefs);
  if (accent) {
    vars["--accent"] = accent;
    vars["--x-color-accent"] = accent;
    vars["--x-color-on-accent"] = onAccent(accent);
    vars["--x-color-accent-soft"] = `${accent}2e`;
  }
  if (prefs.radius !== 8) {
    const r = prefs.radius;
    const px = (n: number) => `${Math.round(n)}px`;
    Object.assign(vars, { "--radius-s": px(r / 2), "--radius-m": px(r * 0.75), "--radius-l": px(r), "--x-radius-sm": px(r / 2), "--x-radius-md": px(r), "--x-radius-lg": px(r * 1.5) });
  }
  if (prefs.sideWidth !== 296) vars["--w-side"] = `${prefs.sideWidth}px`;
  if (prefs.railWidth !== 60) vars["--w-rail"] = `${prefs.railWidth}px`;
  // As react-antd-admin: colour-blind mode inverts the page, grey mode drops colour.
  const filter = [prefs.colorWeak ? "invert(100%)" : "", prefs.gray ? "grayscale(100%)" : ""].filter(Boolean).join(" ");
  return { vars, filter };
}

/** Pure: a tiling SVG of the watermark text at -22°, as a CSS url() for mask-image; CSS paints it with a token. */
export function watermarkUrl(text: string): string {
  const esc = text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="180"><text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" transform="rotate(-22 140 90)">${esc}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Pure: the module script of a built index.html, to tell one deploy from the next; null in dev or when absent. */
export function buildId(html: string): string | null {
  return /<script[^>]+type="module"[^>]+src="([^"]*\/assets\/[^"]+)"/.exec(html)?.[1] ?? null;
}
