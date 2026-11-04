import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterChip } from "./FilterChip";

describe("FilterChip", () => {
  it("is a toggle button with aria-pressed", () => {
    const html = renderToStaticMarkup(<FilterChip pressed>Failed</FilterChip>);
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("task-chip-count");
    expect(renderToStaticMarkup(<FilterChip pressed={false}>Done</FilterChip>)).toContain('aria-pressed="false"');
  });
  it("shows a count, including zero", () => {
    expect(renderToStaticMarkup(<FilterChip pressed={false} count={0}>Waiting</FilterChip>)).toContain('<span class="task-chip-count">0</span>');
  });
});
