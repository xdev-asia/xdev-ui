import { readFileSync } from "node:fs";

/** Shape written by scripts/build-ai.mjs. */
export interface ComponentDoc {
  name: string;
  group: string;
  summary: string;
  import: string;
  /** Exported interfaces, types and consts from <Name>.tsx, verbatim. */
  types: string;
  /** CSS classes the component renders or documents. */
  classes: string[];
  readme: string;
}

export interface TokenDoc {
  name: string;
  /** How to use it in CSS: `var(--name)` or a `font:` shorthand. */
  css: string;
  category: string;
  /** A string, or one value per theme ({ dark, light }), or a type style object. */
  value: unknown;
  usage: string;
}

export interface SkillDoc {
  name: string;
  description: string;
  /** SKILL.md without the frontmatter. */
  body: string;
  /** Every text file of the skill folder; `path` is relative and uses forward slashes. */
  files: { path: string; text: string }[];
}

export interface Manifest {
  package: string;
  version: string;
  setup: string;
  sharedTypes: string;
  icons: string[];
  components: ComponentDoc[];
  tokens: TokenDoc[];
  themes: string[];
  guidelines: Record<string, string>;
  skills: SkillDoc[];
}

/** dist/mcp.js reads dist/ai-manifest.json; XDEV_UI_MANIFEST overrides the path. */
export function loadManifest(): Manifest {
  const url = process.env.XDEV_UI_MANIFEST ?? new URL("./ai-manifest.json", import.meta.url);
  const manifest = JSON.parse(readFileSync(url, "utf8")) as Manifest;
  manifest.skills ??= [];
  // The published package.json carries the released version; the manifest is built before the bump.
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version?: string };
    if (pkg.version) manifest.version = pkg.version;
  } catch {
    // Running outside the package layout: keep the manifest's version.
  }
  return manifest;
}
