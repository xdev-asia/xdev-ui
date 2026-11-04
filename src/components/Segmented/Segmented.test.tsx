import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner] }));
const { Segmented } = await import("./Segmented");

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("Segmented", () => {
  it("renders a group with aria-pressed on the current option", () => {
    const html = renderToStaticMarkup(<Segmented options={options} value="b" label="Mode" />);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Mode"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("segmented");
  });
  it("calls onChange and updates inner state", () => {
    const onChange = vi.fn();
    const buttons = findAll(Segmented({ options, onChange }), (e) => e.type === "button");
    buttons[1].props.onClick();
    expect(onChange).toHaveBeenCalledWith("b");
    expect(setInner).toHaveBeenCalledWith("b");
  });
});
