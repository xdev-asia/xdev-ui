import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ client: false }));
vi.mock("react", async (orig) => {
  const r = await orig<typeof import("react")>();
  return {
    ...r,
    useSyncExternalStore: (s: never, client: () => boolean, server: () => boolean) => (h.client ? client() : server()),
  };
});
vi.mock("react-dom", () => ({
  createPortal: (node: unknown, target: unknown) => ({ portal: node, target }),
}));
const { usePortal } = await import("./portal");

afterEach(() => {
  h.client = false;
  vi.unstubAllGlobals();
});

describe("usePortal", () => {
  it("renders in place on the server (no portal until mounted)", () => {
    const Probe = () => usePortal(true)(createElement("i", null, "x")) as never;
    expect(renderToStaticMarkup(createElement(Probe))).toBe("<i>x</i>");
  });
  it("portals into document.body once mounted", () => {
    h.client = true;
    const body = { tag: "body" };
    vi.stubGlobal("document", { body });
    const node = createElement("i");
    expect(usePortal(true)(node)).toEqual({ portal: node, target: body });
  });
  it("portal false always renders in place", () => {
    h.client = true;
    vi.stubGlobal("document", { body: {} });
    const node = createElement("i");
    expect(usePortal(false)(node)).toBe(node);
  });
});
