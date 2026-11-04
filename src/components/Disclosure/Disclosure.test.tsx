import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner], useId: () => ":r1:" }));
const { Disclosure } = await import("./Disclosure");

describe("Disclosure", () => {
  it("links the head button to its body", () => {
    const html = renderToStaticMarkup(
      <Disclosure title="Staged" count={3} actions={<button type="button">Unstage all</button>}>
        <p>files</p>
      </Disclosure>,
    );
    expect(html).toContain('aria-expanded="true" aria-controls="x-disc-:r1:"');
    expect(html).toContain('<span class="ws-group-count">3</span>');
    expect(html).toContain('<div class="ws-group-actions"><button type="button">Unstage all</button></div>');
    expect(html).toContain('<div class="ws-group-body" id="x-disc-:r1:"><p>files</p></div>');
  });
  it("hides the body when collapsed", () => {
    const html = renderToStaticMarkup(<Disclosure title="Unstaged" expanded={false}>x</Disclosure>);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
  });
  it("toggles from the current state", () => {
    const onToggle = vi.fn();
    findAll(Disclosure({ title: "Staged", defaultExpanded: false, onToggle }), (e) => e.type === "button")[0].props.onClick();
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(setInner).toHaveBeenCalledWith(true);
  });
});
