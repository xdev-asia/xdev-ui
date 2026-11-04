import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentChip } from "./AgentChip";

describe("AgentChip", () => {
  it("claude shows C with data-profile", () => {
    const html = renderToStaticMarkup(<AgentChip profile="claude" />);
    expect(html).toContain('data-profile="claude"');
    expect(html).toContain(">C<");
    expect(html).toContain('role="img"');
  });
  it("custom uses the letter and title", () => {
    const html = renderToStaticMarkup(<AgentChip letter="Z" title="Zed" />);
    expect(html).toContain(">Z<");
    expect(html).toContain('aria-label="Zed"');
    expect(html).not.toContain("data-profile");
  });
});
