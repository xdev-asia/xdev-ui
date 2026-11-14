import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaletteTrigger } from "./PaletteTrigger";

describe("PaletteTrigger", () => {
  it("is a button that opens a dialog and names its shortcut", () => {
    const html = renderToStaticMarkup(<PaletteTrigger onOpen={() => {}} />);
    expect(html).toContain('<button type="button" class="x-palette-trigger" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K"');
    expect(html).toContain("Search");
    expect(html).toContain("Ctrl K");
  });

  it("hides the key hint without the hotkey and takes a translated label", () => {
    const html = renderToStaticMarkup(<PaletteTrigger onOpen={() => {}} hotkey={false} labels={{ search: "Tìm kiếm" }} />);
    expect(html).toContain("Tìm kiếm");
    expect(html).not.toContain("aria-keyshortcuts");
    expect(html).not.toContain("<kbd");
  });
});
