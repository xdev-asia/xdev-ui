import { describe, expect, it, vi } from "vitest";
import { reveal } from "./reveal";

const rect = (top: number, bottom: number) => ({ top, bottom }) as DOMRect;

describe("reveal", () => {
  it("scrolls the list that holds the row, never the page", () => {
    vi.stubGlobal("document", { scrollingElement: null, body: {}, documentElement: {} });
    try {
      const list = { scrollHeight: 400, clientHeight: 200, scrollTop: 0, parentElement: null, getBoundingClientRect: () => rect(100, 300) };
      const below = { parentElement: list, getBoundingClientRect: () => rect(320, 350) } as unknown as HTMLElement;
      reveal(below);
      expect(list.scrollTop).toBe(50);
      const above = { parentElement: list, getBoundingClientRect: () => rect(80, 110) } as unknown as HTMLElement;
      reveal(above);
      expect(list.scrollTop).toBe(30);
      const page = { scrollHeight: 5000, clientHeight: 900, scrollTop: 0, parentElement: null, getBoundingClientRect: () => rect(0, 900) };
      (document as unknown as { scrollingElement: unknown }).scrollingElement = page;
      const inline = { parentElement: { scrollHeight: 10, clientHeight: 10, parentElement: page }, getBoundingClientRect: () => rect(2000, 2030) } as unknown as HTMLElement;
      reveal(inline);
      expect(page.scrollTop).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
