import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";

vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useEffect: () => {},
  useRef: (v: unknown) => ({ current: v }),
}));
const { FormDialog } = await import("./FormDialog");
const noop = (): void => {};

describe("FormDialog", () => {
  it("is a labelled modal form with a submit button last", () => {
    const html = renderToStaticMarkup(<FormDialog title="New user" description="They get an email" onSubmit={noop} onCancel={noop} />);
    expect(html).toContain('<form class="dialog x-form-dialog"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-labelledby="x-fdialog-id"');
    expect(html).toContain('aria-describedby="x-fdialog-d-id"');
    expect(html).toMatch(/Cancel<\/button><button type="submit" class="btn">Save<\/button>/);
  });
  it("submitLabel names the action", () => {
    expect(renderToStaticMarkup(<FormDialog title="x" submitLabel="Create user" onSubmit={noop} onCancel={noop} />)).toContain(">Create user</button>");
  });
  it("busy disables both buttons, shows saving and ignores cancel and submit", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const html = renderToStaticMarkup(<FormDialog title="x" busy onSubmit={onSubmit} onCancel={onCancel} />);
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain("Saving");
    const tree = FormDialog({ title: "x", busy: true, onSubmit, onCancel });
    tree.props.onKeyDown({ key: "Escape", stopPropagation: noop });
    const form = tree.props.children;
    const e = { preventDefault: vi.fn() };
    form.props.onSubmit(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
  it("submit prevents navigation and calls onSubmit; cancel calls onCancel", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const tree = FormDialog({ title: "x", onSubmit, onCancel });
    const e = { preventDefault: vi.fn() };
    tree.props.children.props.onSubmit(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(e);
    findAll(tree, (el) => el.type === Button)[0].props.onClick();
    expect(onCancel).toHaveBeenCalledOnce();
  });
  it("shows a form error as an alert", () => {
    expect(renderToStaticMarkup(<FormDialog title="x" error="Email already used" onSubmit={noop} onCancel={noop} />)).toContain(
      '<p class="x-form-dialog-error" role="alert">Email already used</p>',
    );
  });
});
