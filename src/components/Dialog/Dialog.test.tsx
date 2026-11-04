import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { Dialog } = await import("./Dialog");

describe("Dialog", () => {
  it("is a labelled modal dialog", () => {
    const html = renderToStaticMarkup(<Dialog title="Kill session?">Body</Dialog>);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="x-dialog-id"');
    expect(html).toContain("dialog-actions");
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
});
