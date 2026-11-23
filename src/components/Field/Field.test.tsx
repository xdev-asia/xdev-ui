import { renderToStaticMarkup } from "react-dom/server";
import type { JSX } from "react";
import { describe, expect, it, vi } from "vitest";

// useState is driven from here: `state.shown` is the toggle's current value, `state.set` records updates.
const state = vi.hoisted(() => ({ shown: undefined as boolean | undefined, set: vi.fn() }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useState: (v: unknown) => [state.shown ?? v, state.set],
}));
const { Field } = await import("./Field");
const { findAll } = await import("../../test-utils");

describe("Field", () => {
  it("links the hint with aria-describedby", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="kebab-case" id="b" />);
    expect(html).toContain('for="b"');
    expect(html).toContain('aria-describedby="b-hint"');
    expect(html).toContain('<small id="b-hint">kebab-case</small>');
    expect(html).not.toContain("aria-invalid");
  });
  it("error replaces hint and marks invalid", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="hintText" error="Required" id="b" />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Required");
    expect(html).not.toContain("hintText");
    expect(html).toContain("data-invalid");
  });
  it("hint and error sit outside the label, inside the ws-field wrapper", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="kebab-case" id="b" className="extra" />);
    expect(html).toMatch(/^<div class="ws-field extra"><label for="b" class="x-label">Branch<\/label><input id="b" aria-describedby="b-hint"\/><small id="b-hint">kebab-case<\/small><\/div>$/);
    const err = renderToStaticMarkup(<Field label="Branch" error="Required" id="b" />);
    expect(err).toContain('<label for="b" class="x-label">Branch</label>');
    expect(err).toMatch(/<\/label><input[^>]*aria-invalid="true"[^>]*\/><small id="b-hint">Required<\/small><\/div>$/);
  });
  it("passes ref to the input", () => {
    const ref = { current: null };
    const tree = Field({ label: "x", id: "b", ref });
    const input = (tree.props.children as any[]).find((c) => c?.type === "input");
    expect(input.props.ref).toBe(ref);
  });
  it("hideLabel keeps the label for screen readers only", () => {
    const html = renderToStaticMarkup(<Field label="Search" hideLabel id="s" />);
    expect(html).toContain('<label for="s" class="x-label x-sr-only">Search</label>');
    expect(renderToStaticMarkup(<Field label="Search" id="s" />)).toContain('<label for="s" class="x-label">Search</label>');
  });
  it("mono sets the value in the mono face only", () => {
    const html = renderToStaticMarkup(<Field label="Id" mono id="m" />);
    expect(html).toContain('<input id="m" class="ws-mono"');
    expect(html).toContain('<label for="m" class="x-label">Id</label>');
    expect(renderToStaticMarkup(<Field label="Id" id="m" />)).not.toContain("ws-mono");
  });
  it("action sits on the label row, end-aligned, outside the label", () => {
    const html = renderToStaticMarkup(<Field label="Secret" id="k" action={<button type="button">Generate</button>} />);
    expect(html).toContain('<div class="x-field-label-row"><label for="k" class="x-label">Secret</label><span class="x-field-action"><button type="button">Generate</button></span></div><input id="k"/>');
    expect(renderToStaticMarkup(<Field label="Secret" id="k" />)).not.toContain("x-field-label-row");
  });
  it("end renders inside the control after the input, which keeps its links", () => {
    const html = renderToStaticMarkup(<Field label="Timeout" id="t" hint="In ms" end="ms" />);
    expect(html).toContain('<div class="x-field-control"><input id="t" aria-describedby="t-hint"/><span class="x-field-end">ms</span></div><small id="t-hint">In ms</small>');
    expect(renderToStaticMarkup(<Field label="Timeout" id="t" />)).not.toContain("x-field-control");
  });
  it("password: a show toggle, not pressed, hides the value", () => {
    state.shown = undefined;
    const html = renderToStaticMarkup(<Field label="Password" id="p" type="password" />);
    expect(html).toContain('<div class="x-field-control"><input id="p" type="password"/><span class="x-field-end">');
    expect(html).toMatch(/<button type="button" class="ws-icon-btn" aria-label="Show password" title="Show password" data-size="sm" aria-pressed="false" aria-controls="p">/);
  });
  it("password: pressing the toggle shows the value as text and renames the toggle", () => {
    state.shown = undefined;
    state.set.mockClear();
    const tree = Field({ label: "Password", id: "p", type: "password" });
    const control = findAll(tree, (el) => typeof el.type === "function" && el.type.name === "PasswordControl")[0];
    expect(control).toBeDefined();
    const inner = (control!.type as (p: unknown) => JSX.Element)(control!.props);
    const toggle = findAll(inner, (el) => el.props["aria-pressed"] !== undefined)[0];
    toggle!.props.onClick();
    const update = state.set.mock.calls[0]?.[0] as (v: boolean) => boolean;
    expect(update(false)).toBe(true);
    expect(update(true)).toBe(false);

    state.shown = true;
    const html = renderToStaticMarkup(<Field label="Password" id="p" type="password" />);
    expect(html).toContain('<input id="p" type="text"/>');
    expect(html).toMatch(/aria-label="Hide password"[^>]*aria-pressed="true"/);
    state.shown = undefined;
  });
  it("password: labels translate the toggle, reveal={false} opts out, end comes before the toggle", () => {
    const vi_ = renderToStaticMarkup(<Field label="Mật khẩu" id="p" type="password" labels={{ show: "Hiện mật khẩu" }} />);
    expect(vi_).toContain('aria-label="Hiện mật khẩu"');
    const off = renderToStaticMarkup(<Field label="Password" id="p" type="password" reveal={false} />);
    expect(off).not.toContain("aria-pressed");
    expect(off).toContain('<input id="p" type="password"/>');
    const both = renderToStaticMarkup(<Field label="Password" id="p" type="password" end={<span>A</span>} />);
    expect(both).toMatch(/<span class="x-field-end"><span>A<\/span><button [^>]*aria-pressed="false"/);
    expect(renderToStaticMarkup(<Field label="Password" id="p" type="password" disabled />)).toMatch(/aria-pressed="false" aria-controls="p" disabled=""/);
  });
});
