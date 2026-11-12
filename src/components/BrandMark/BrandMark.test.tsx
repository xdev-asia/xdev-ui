import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./BrandMark";

const YOU = "M185 232H335L575 512L335 792H185L425 512Z";
const AGENT = "M839 232H689L449 512L689 792H839L599 512Z";
const CORE = "M512 438.5L575 512L512 585.5L449 512Z";
const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "../../..");
const brandDir = join(repo, "assets/brand");

describe("BrandMark", () => {
  it("mark is a bare svg named xDev by default, keeping the x-mark class", () => {
    const html = renderToStaticMarkup(<BrandMark size={18} className="ws-logo" />);
    expect(html).toContain('class="x-mark ws-logo"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="xDev"');
    expect(html).not.toContain("aria-hidden");
  });
  it("mark with an empty label is decorative", () => {
    const html = renderToStaticMarkup(<BrandMark size={18} className="ws-logo" label="" />);
    expect(html).toMatch(/^<svg /);
    expect(html).toContain('width="18"');
    expect(html).toContain('height="18"');
    expect(html).toContain('viewBox="162 162 700 700"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });
  it("mark defaults to 24 px", () => {
    expect(renderToStaticMarkup(<BrandMark />)).toContain('width="24"');
  });
  it("mark draws your blade in currentColor, the agent blade in --brand-agent and the core", () => {
    const html = renderToStaticMarkup(<BrandMark />);
    expect(html).toContain(`<path d="${YOU}" fill="currentColor"`);
    expect(html).toContain(`<path d="${AGENT}" style="fill:var(--brand-agent)"`);
    expect(html).toContain(`<path d="${CORE}"`);
  });
  it("mark of a sub-system keeps your blade and swaps the agent blade for its shape", () => {
    const html = renderToStaticMarkup(<BrandMark system="cleaner" />);
    expect(html).toContain(`d="${YOU}"`);
    expect(html).not.toContain(AGENT);
    expect(html).not.toContain(CORE);
    expect(html).toContain("M722 527V412");
    expect(html).toContain('aria-label="Cleaner for xDev"');
  });
  it("names every system", () => {
    const name = (system: Parameters<typeof BrandMark>[0]["system"]) => /aria-label="([^"]+)"/.exec(renderToStaticMarkup(<BrandMark system={system} />))?.[1];
    expect([name("xdev"), name("cleaner"), name("ui")]).toEqual(["xDev", "Cleaner for xDev", "xDev UI"]);
  });
  it("tile under 48 px is flat", () => {
    const html = renderToStaticMarkup(<BrandMark variant="tile" size={32} />);
    expect(html).toContain("x-mark-tile");
    expect(html).toContain('width="32"');
    expect(html).not.toContain("linearGradient");
    expect(html).not.toContain("feGaussianBlur");
  });
  it("tile from 48 px up is the lit icon", () => {
    const html = renderToStaticMarkup(<BrandMark variant="tile" size={48} />);
    expect(html).toContain("x-mark-tile");
    expect(html).toContain("linearGradient");
    expect(html).toContain("feGaussianBlur");
  });
  it("two lit tiles on one page do not share paint ids", () => {
    const html = renderToStaticMarkup(
      <>
        <BrandMark variant="tile" size={64} />
        <BrandMark variant="tile" size={64} system="ui" />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("lockup is the tile plus the wordmark, with no cursor", () => {
    const html = renderToStaticMarkup(<BrandMark variant="lockup" size={32} />);
    expect(html).toContain("x-lockup");
    expect(html).toContain('<span class="x-lockup-word" aria-hidden="true">xDev</span>');
    expect(html).not.toContain("x-lockup-cursor");
    expect(html).not.toContain("x-lockup-sub");
  });
  it("lockup of a sub-system sets its own name lighter than xDev", () => {
    const html = renderToStaticMarkup(<BrandMark variant="lockup" system="ui" />);
    expect(html).toContain('aria-label="xDev UI"');
    expect(html).toContain('<span class="x-lockup-word" aria-hidden="true">xDev</span>');
    expect(html).toContain('<span class="x-lockup-sub" aria-hidden="true">UI</span>');
  });
  it("lockup of Cleaner for xDev leads with Cleaner", () => {
    const html = renderToStaticMarkup(<BrandMark variant="lockup" system="cleaner" />);
    expect(html).toContain('<span class="x-lockup-word" aria-hidden="true">Cleaner</span>');
    expect(html).toContain('<span class="x-lockup-sub" aria-hidden="true">for xDev</span>');
  });
  it("the static mark in assets/brand has the same blades and core", () => {
    const svg = readFileSync(join(brandDir, "xdev-mark.svg"), "utf8");
    for (const d of [YOU, AGENT, CORE]) expect(svg).toContain(`d="${d}"`);
  });
  it("the static cleaner mark in assets/brand has the same disk as the component", () => {
    const svg = readFileSync(join(brandDir, "systems/xdev-cleaner-mark.svg"), "utf8");
    const html = renderToStaticMarkup(<BrandMark system="cleaner" />);
    const disk = /d="(M722 527[^"]+)"/.exec(html)?.[1];
    expect(disk).toBeTruthy();
    expect(svg).toContain(`d="${disk}"`);
  });
  // This package is public. A system gets a mark here only once it is public too.
  it("assets/brand/systems holds files of public systems only", () => {
    const other = readdirSync(join(brandDir, "systems")).filter((f) => !/^xdev-(cleaner|ui)-/.test(f));
    expect(other).toEqual([]);
  });
});
