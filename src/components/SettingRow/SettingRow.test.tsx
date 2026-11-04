import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingRow } from "./SettingRow";

describe("SettingRow", () => {
  it("links the label and hint to the control", () => {
    const html = renderToStaticMarkup(
      <SettingRow
        id="restore"
        controlId="restore-input"
        label="Restore sessions"
        description="Reopen agent sessions on launch."
        control={<input id="restore-input" aria-describedby="restore-input-hint" />}
        flash
      />,
    );
    expect(html).toContain('<div class="settings-item setting-flash" id="restore">');
    expect(html).toContain('<label class="settings-label" for="restore-input">Restore sessions</label>');
    expect(html).toContain('<p class="settings-hint" id="restore-input-hint">');
    expect(html).toContain('<div class="settings-item-control"><input');
  });
  it("uses a plain span without a control id", () => {
    const html = renderToStaticMarkup(<SettingRow label="Theme" />);
    expect(html).toContain('<span class="settings-label">Theme</span>');
    expect(html).not.toContain("settings-hint");
    expect(html).not.toContain("setting-flash");
  });
});
