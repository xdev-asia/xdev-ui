export type CodeAlphabet = "crockford" | "digits";

/** Crockford base32: digits and letters without I, L, O, U. */
const CROCKFORD = /^[0-9A-HJKMNP-TV-Z]$/;
const DIGITS = /^[0-9]$/;

/**
 * Cleans typed or pasted text into code characters: upper case, no spaces or dashes.
 * Crockford maps O to 0 and I or L to 1; characters outside the alphabet are dropped.
 */
export function normalizeCode(raw: string, alphabet: CodeAlphabet = "crockford"): string {
  const text = raw.toUpperCase().replace(/[\s-]/g, "");
  const keep = alphabet === "digits" ? DIGITS : CROCKFORD;
  let out = "";
  for (let ch of text) {
    if (alphabet === "crockford") ch = ch === "O" ? "0" : ch === "I" || ch === "L" ? "1" : ch;
    if (keep.test(ch)) out += ch;
  }
  return out;
}

/** Splits a code into groups of `size` characters; separators in `value` are ignored. */
export function groupCode(value: string, size: number): string[] {
  const chars = value.replace(/[\s-]/g, "");
  const n = Math.max(1, Math.floor(size));
  const out: string[] = [];
  for (let i = 0; i < chars.length; i += n) out.push(chars.slice(i, i + n));
  return out;
}

/** Writes a code in groups of `group` characters joined by `sep` (`7K4QM2XD9P` becomes `7K4QM-2XD9P`). */
export function formatCode(code: string, group = 5, sep = "-"): string {
  return groupCode(code, group).join(sep);
}
