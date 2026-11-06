// Wraps a built stylesheet in a cascade layer, for apps that order layers themselves (Tailwind v4: `@layer xdev, utilities;`).
// @charset and @import must stay before any other rule, so they are kept on top, outside the layer.

/**
 * @param {string} css
 * @param {string} [name]
 * @returns {string}
 */
export function wrapInLayer(css, name = "xdev") {
  const head = [];
  let rest = css;
  for (;;) {
    const m = /^\s*@(?:charset|import)\b[^;]*;\s*/.exec(rest);
    if (!m) break;
    head.push(m[0].trim());
    rest = rest.slice(m[0].length);
  }
  const top = head.length ? `${head.join("\n")}\n` : "";
  return `${top}@layer ${name} {\n${rest.trim()}\n}\n`;
}
