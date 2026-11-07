import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ApprovalBar } from "./ApprovalBar";

describe("ApprovalBar", () => {
  it("renders a focusable group with a live region, the command and three buttons", () => {
    const html = renderToStaticMarkup(<ApprovalBar title="Run a shell command" command="rm -rf dist" onAllow={() => {}} onAlways={() => {}} onDeny={() => {}} />);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Approval needed"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Run a shell command");
    expect(html).toContain('<code class="x-approval-command">rm -rf dist</code>');
    expect(html).toContain('type="button" class="btn" data-size="sm">Allow<');
    expect(html).toContain('class="btn-secondary"');
    expect(html).toContain("Always allow");
    expect(html).toContain('class="btn-ghost"');
    expect(html).toContain(">Deny<");
  });
  it("has exactly one primary button", () => {
    const html = renderToStaticMarkup(<ApprovalBar title="t" onAllow={() => {}} onAlways={() => {}} onDeny={() => {}} />);
    expect(html.match(/class="btn"/g)).toHaveLength(1);
  });
  it("omits Always allow and the command when not given", () => {
    const html = renderToStaticMarkup(<ApprovalBar title="t" onAllow={() => {}} onDeny={() => {}} />);
    expect(html).not.toContain("Always allow");
    expect(html).not.toContain("x-approval-command");
  });
  it("busy disables every button", () => {
    const html = renderToStaticMarkup(<ApprovalBar title="t" busy onAllow={() => {}} onAlways={() => {}} onDeny={() => {}} />);
    expect(html.match(/disabled=""/g)).toHaveLength(3);
  });
  it("labels replace every English default", () => {
    const html = renderToStaticMarkup(
      <ApprovalBar title="t" onAllow={() => {}} onAlways={() => {}} onDeny={() => {}} labels={{ region: "§r§", allow: "§a§", always: "§l§", deny: "§d§" }} />,
    );
    for (const w of ["Approval needed", ">Allow<", "Always allow", ">Deny<"]) expect(html).not.toContain(w);
    for (const w of ["§r§", "§a§", "§l§", "§d§"]) expect(html).toContain(w);
  });
});
