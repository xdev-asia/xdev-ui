import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("is a status with optional action and dismiss", () => {
    const html = renderToStaticMarkup(
      <Toast actionLabel="Undo" onDismiss={() => {}}>
        Archived
      </Toast>,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("Undo");
    expect(html).toContain('aria-label="Dismiss"');
  });
  it("hides dismiss and action by default", () => {
    expect(renderToStaticMarkup(<Toast>Hi</Toast>)).not.toContain("button");
  });
  it("wires onDismiss", () => {
    const onDismiss = vi.fn();
    findAll(Toast({ children: "x", onDismiss }), (e) => e.type === "button")[0].props.onClick();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
