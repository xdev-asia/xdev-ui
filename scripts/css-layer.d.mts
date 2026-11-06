/** Wraps `css` in `@layer <name> { ... }`, keeping leading @charset and @import outside. Default name "xdev". */
export function wrapInLayer(css: string, name?: string): string;
