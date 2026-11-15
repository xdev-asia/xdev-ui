import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({ inRegion: false }));
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useContext: () => h.inRegion }));
const { Toast } = await import("./Toast");

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
  it("is alert for danger when it stands alone", () => {
    expect(renderToStaticMarkup(<Toast tone="danger">Failed</Toast>)).toContain('role="alert"');
  });
  it("drops its own role inside a live region that announces it (AppShell, Toaster)", () => {
    h.inRegion = true;
    try {
      expect(renderToStaticMarkup(<Toast>Saved</Toast>)).not.toContain("role=");
      expect(renderToStaticMarkup(<Toast tone="danger">Failed</Toast>)).not.toContain("role=");
    } finally {
      h.inRegion = false;
    }
  });
});
