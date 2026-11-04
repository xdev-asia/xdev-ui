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
const { Dialog } = await import("./Dialog");

describe("Dialog", () => {
  it("is a labelled modal dialog", () => {
    const html = renderToStaticMarkup(<Dialog title="Kill session?">Body</Dialog>);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="x-dialog-id"');
    expect(html).toContain("dialog-actions");
  });
  it("is default size with a text body unless asked otherwise", () => {
    const html = renderToStaticMarkup(<Dialog title="x">Body</Dialog>);
    expect(html).toContain('data-size="default"');
    expect(html).toContain('<p class="dialog-body">Body</p>');
  });
  it("size wide and body plain allow block content", () => {
    const html = renderToStaticMarkup(
      <Dialog title="x" size="wide" body="plain">
        <div>block</div>
      </Dialog>,
    );
    expect(html).toContain('data-size="wide"');
    expect(html).toContain('<div class="dialog-body"><div>block</div></div>');
    expect(html).not.toContain("<p");
  });
  it("alert uses alertdialog", () => {
    expect(renderToStaticMarkup(<Dialog title="x" alert />)).toContain('role="alertdialog"');
  });
  it("wires cancel and confirm; the primary button is last", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const buttons = findAll(Dialog({ title: "x", onConfirm, onCancel }), (e) => e.type === Button);
    expect(buttons).toHaveLength(2);
    buttons[0].props.onClick();
    buttons[1].props.onClick();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(buttons[0].props.variant).toBe("secondary");
    expect(buttons[1].props.variant).toBeUndefined();
  });
  it("modal sets data-modal on the backdrop", () => {
    expect(renderToStaticMarkup(<Dialog title="x" modal />)).toContain('class="dialog-backdrop" data-modal="true"');
    expect(renderToStaticMarkup(<Dialog title="x" />)).not.toContain("data-modal");
  });
  it("wraps string children in a p and element children in a div", () => {
    expect(renderToStaticMarkup(<Dialog title="x">Plain</Dialog>)).toContain('<p class="dialog-body">Plain</p>');
    const html = renderToStaticMarkup(<Dialog title="x"><form><input /></form></Dialog>);
    expect(html).toContain('<div class="dialog-body"><form>');
    expect(html).not.toContain("<p");
  });
  it("confirmDisabled disables the confirm button", () => {
    const buttons = findAll(Dialog({ title: "x", confirmDisabled: true }), (e) => e.type === Button);
    expect(buttons[1].props.disabled).toBe(true);
    expect(buttons[0].props.disabled).toBeUndefined();
  });
  it("Escape calls onCancel when modal", () => {
    const onCancel = vi.fn();
    const [backdrop] = findAll(Dialog({ title: "x", modal: true, onCancel }), (e) => e.props.className === "dialog-backdrop");
    const other = { key: "a", stopPropagation: vi.fn() };
    backdrop.props.onKeyDown(other);
    expect(onCancel).not.toHaveBeenCalled();
    backdrop.props.onKeyDown({ key: "Escape", stopPropagation: vi.fn() });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
