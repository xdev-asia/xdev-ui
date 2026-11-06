import { foldText } from "../../internal/text";
import type { FacetOption } from "./FacetFilter";

/** Options whose label contains the query (trimmed, case and diacritic insensitive). An empty query keeps all; order is kept. */
export function filterFacetOptions<T extends Pick<FacetOption, "label">>(options: readonly T[], query: string): T[] {
  const q = foldText(query.trim());
  if (!q) return [...options];
  return options.filter((o) => foldText(o.label).includes(q));
}

/** Adds or removes `value`. The result follows the order of `options`; selected values that are not options stay, at the end. */
export function toggleFacetValue(selected: readonly string[], value: string, options: readonly Pick<FacetOption, "value">[]): string[] {
  const next = new Set(selected);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  const known = options.map((o) => o.value);
  const rest = [...next].filter((v) => !known.includes(v));
  return [...known.filter((v) => next.has(v)), ...rest];
}
