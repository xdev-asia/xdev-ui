/** Fonts offered as suggestions in a font field. Any installed family name is accepted too. */
export const UI_FONT_SUGGESTIONS: readonly string[] = [
  "Be Vietnam Pro",
  "Inter",
  "Segoe UI",
  "Roboto",
  "Noto Sans",
  "Arial",
];

/** The longest family name `fontStack` accepts. */
export const FONT_NAME_MAX = 120;

/** The part of an element that `applyUiFont` uses (an HTMLElement fits). */
export interface FontRoot {
  style: { setProperty(name: string, value: string): void; removeProperty(name: string): unknown };
}

const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * Turns a family name the user typed into a CSS `font-family` value that starts with it, then the
 * default body stack (`var(--x-font-body-fallback)`). Empty input gives `null`, which means "use
 * the default". Quotes, slashes, braces and semicolons are dropped so the name cannot end the
 * declaration or add another.
 */
export function fontStack(name: string): string | null {
  const clean = Array.from(name.replace(CONTROL, "").replace(/["'\\{};<>]/g, "").trim())
    .slice(0, FONT_NAME_MAX)
    .join("")
    .trim();
  if (clean === "") return null;
  return `"${clean}", var(--x-font-body-fallback)`;
}

/** Paints the UI font on the root, or restores the default when `name` is empty. */
export function applyUiFont(root: FontRoot, name: string): void {
  const stack = fontStack(name);
  if (stack === null) root.style.removeProperty("--font-body");
  else root.style.setProperty("--font-body", stack);
}
