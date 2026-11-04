import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionTile } from "./ActionTile";

describe("ActionTile", () => {
  it("is a button with icon, title and description", () => {
    const html = renderToStaticMarkup(<ActionTile icon="swap" title="Hand off a task" description="Move ownership." onClick={() => {}} />);
    expect(html).toContain('<button type="button" class="x-action-tile"');
    expect(html).toContain("<svg");
    expect(html).toContain('<span class="x-action-tile-title">Hand off a task</span>');
    expect(html).toContain('<span class="x-action-tile-desc">Move ownership.</span>');
  });
  it("can be disabled", () => {
    expect(renderToStaticMarkup(<ActionTile icon="swap" title="T" description="D" disabled onClick={() => {}} />)).toContain("disabled");
  });
  it("registers the new icons", async () => {
    const { ICON_NAMES } = await import("../../icons");
    for (const n of ["swap", "list-checks", "workflow"]) expect(ICON_NAMES).toContain(n);
  });
});
