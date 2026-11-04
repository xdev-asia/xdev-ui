import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner], useId: () => ":g1:" }));
const { RadioGroup } = await import("./RadioGroup");

const options = [
  { value: "pwsh", label: "PowerShell" },
  { value: "bash", label: "Git Bash", hint: "From Git for Windows" },
  { value: "cmd", label: "Command Prompt", disabled: true },
];

describe("RadioGroup", () => {
  it("is a labelled radiogroup of native radios", () => {
    const html = renderToStaticMarkup(<RadioGroup name="shell" label="Default shell" options={options} value="bash" />);
    expect(html).toContain('role="radiogroup"');
    expect(html).toMatch(/aria-labelledby="[^"]+-label"/);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html.match(/name="shell"/g)).toHaveLength(3);
    expect(html).toMatch(/<input type="radio" id="[^"]+-bash"[^>]* checked=""[^>]*value="bash"/);
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).toMatch(/aria-describedby="[^"]+-bash-hint"/);
  });
  it("disables single options or the whole group", () => {
    expect(renderToStaticMarkup(<RadioGroup name="s" aria-label="Shell" options={options} />).match(/ disabled=""/g)).toHaveLength(1);
    const html = renderToStaticMarkup(<RadioGroup name="s" aria-label="Shell" options={options} disabled orientation="vertical" />);
    expect(html.match(/ disabled=""/g)).toHaveLength(3);
    expect(html).toContain('aria-label="Shell"');
    expect(html).toContain('data-orientation="vertical"');
  });
  it("wires onChange", () => {
    const onChange = vi.fn();
    findAll(RadioGroup({ name: "s", options, onChange }), (e) => e.type === "input")[1].props.onChange();
    expect(onChange).toHaveBeenCalledWith("bash");
    expect(setInner).toHaveBeenCalledWith("bash");
  });
});
