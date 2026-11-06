import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { PairingCode } from "./PairingCode";

describe("PairingCode", () => {
  it("renders the groups with the full code kept for screen readers", () => {
    const html = renderToStaticMarkup(<PairingCode value="7K4QM-2XD9P" label="Pairing code" />);
    expect(html).toContain('role="group" aria-label="Pairing code"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('<span class="x-sr-only">7K4QM 2XD9P</span>');
    expect(html).toContain('<span class="x-pairing-code-group">7K4QM</span><span class="x-pairing-code-group">2XD9P</span>');
    expect(html.replace(/<[^>]*>/g, "")).not.toContain("-");
  });
  it("groups a check code by 3 and takes the md size", () => {
    const html = renderToStaticMarkup(<PairingCode value="482 913" groupSize={3} size="md" />);
    expect(html).toContain('<span class="x-pairing-code-group">482</span><span class="x-pairing-code-group">913</span>');
    expect(html).toContain('data-size="md"');
    expect(html).not.toContain("aria-label");
  });
  it("shows the copy button only with copyLabel, and it calls onCopy", () => {
    expect(renderToStaticMarkup(<PairingCode value="7K4QM2XD9P" />)).not.toContain("<button");
    const onCopy = vi.fn();
    const html = renderToStaticMarkup(<PairingCode value="7K4QM2XD9P" copyLabel="Copy code" onCopy={onCopy} />);
    expect(html).toContain('aria-label="Copy code"');
    const button = findAll(PairingCode({ value: "7K4QM2XD9P", copyLabel: "Copy code", onCopy }), (e) => e.props.label === "Copy code")[0];
    button.props.onClick();
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
