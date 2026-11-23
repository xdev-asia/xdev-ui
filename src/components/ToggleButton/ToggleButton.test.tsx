import { isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { nextPressed, ToggleButton, type ToggleButtonProps } from "./ToggleButton";

/** The <button> element ToggleButton returns, so its handler can be called without a DOM. */
function button(props: ToggleButtonProps): ReactElement<{ onClick: (e: { defaultPrevented: boolean }) => void }> {
  const el = ToggleButton(props);
  if (!isValidElement(el)) throw new Error("not an element");
  return el as ReactElement<{ onClick: (e: { defaultPrevented: boolean }) => void }>;
}

describe("ToggleButton", () => {
  it("is a native button with aria-pressed for both states", () => {
    const on = renderToStaticMarkup(<ToggleButton pressed>apps:delete</ToggleButton>);
    expect(on).toContain("<button");
    expect(on).toContain('type="button"');
    expect(on).toContain('aria-pressed="true"');
    expect(renderToStaticMarkup(<ToggleButton pressed={false}>apps:read</ToggleButton>)).toContain('aria-pressed="false"');
  });

  it("marks the check mark decorative and keeps the label as the accessible name", () => {
    const html = renderToStaticMarkup(<ToggleButton pressed>apps:delete</ToggleButton>);
    expect(html).toContain('class="x-icon x-toggle-check"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<span class="x-toggle-label">apps:delete</span>');
  });

  it("sets the warning tone and size as data attributes", () => {
    const html = renderToStaticMarkup(<ToggleButton pressed={false} tone="warning" size="md">x</ToggleButton>);
    expect(html).toContain('data-tone="warning"');
    expect(html).toContain('data-size="md"');
    expect(renderToStaticMarkup(<ToggleButton pressed={false}>x</ToggleButton>)).not.toContain("data-tone");
  });

  it("passes title, data-* and disabled through to the button", () => {
    const html = renderToStaticMarkup(
      <ToggleButton pressed={false} title="Only owners can grant this" data-grant-only="" disabled>
        x
      </ToggleButton>,
    );
    expect(html).toContain('title="Only owners can grant this"');
    expect(html).toContain('data-grant-only=""');
    expect(html).toContain("disabled");
  });

  it("asks for the opposite value on click (Space and Enter fire click on a native button)", () => {
    expect(nextPressed(true)).toBe(false);
    expect(nextPressed(false)).toBe(true);
    const change = vi.fn();
    button({ pressed: false, onPressedChange: change, children: "x" }).props.onClick({ defaultPrevented: false });
    button({ pressed: true, onPressedChange: change, children: "x" }).props.onClick({ defaultPrevented: false });
    expect(change.mock.calls).toEqual([[true], [false]]);
  });

  it("runs onClick first and lets preventDefault cancel the change", () => {
    const order: string[] = [];
    const change = vi.fn(() => order.push("change"));
    button({ pressed: false, onPressedChange: change, onClick: () => order.push("click"), children: "x" }).props.onClick({ defaultPrevented: false });
    expect(order).toEqual(["click", "change"]);
    change.mockClear();
    button({ pressed: false, onPressedChange: change, children: "x" }).props.onClick({ defaultPrevented: true });
    expect(change).not.toHaveBeenCalled();
  });
});
