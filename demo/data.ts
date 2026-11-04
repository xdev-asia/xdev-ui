// Everything the home page states comes from the generated manifest or the story files.
import manifest from "../generated/ai-manifest.json";

declare const __STORY_TITLES__: Record<string, string>;

export const REPO = "https://github.com/xdev-asia/xdev-ui";

export interface Comp {
  name: string;
  group: string;
  summary: string;
  import: string;
  classes: string[];
  localised: boolean;
  href: string;
  hasStory: boolean;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const storyHref = (title: string) => `./storybook/?path=/docs/${slug(title)}--docs`;

export const COMPONENTS: Comp[] = manifest.components.map((c) => {
  const title = __STORY_TITLES__[c.name];
  return {
    name: c.name,
    group: c.group,
    summary: c.summary,
    import: c.import,
    classes: c.classes,
    localised: /\blabels\?:/.test(c.types),
    hasStory: Boolean(title),
    href: title ? storyHref(title) : `${REPO}/tree/main/src/components/${c.name}`,
  };
});

export const GROUP_ORDER = ["Actions", "Inputs", "Display", "Status", "Navigation", "Overlays", "Layout", "Brand"];

export const GROUPS = [...new Set([...GROUP_ORDER, ...COMPONENTS.map((c) => c.group)])]
  .map((g) => ({ name: g, items: COMPONENTS.filter((c) => c.group === g) }))
  .filter((g) => g.items.length > 0);

/** null while package.json still holds the semantic-release placeholder. */
export const VERSION: string | null = /development/.test(manifest.version) ? null : manifest.version;
export const TOKEN_COUNT = Array.isArray(manifest.tokens) ? manifest.tokens.length : Object.keys(manifest.tokens).length;
export const ICON_COUNT = Array.isArray(manifest.icons) ? manifest.icons.length : Object.keys(manifest.icons).length;

export const MCP_TOOLS = [
  { name: "xdevui_list_components", body: "Every component with its group and one-line purpose.", terms: ["group", "purpose", "no input"] },
  { name: "xdevui_get_component", body: "One component: README, import line, exported props verbatim and the classes it renders.", terms: ["README", "props", "classes"] },
  { name: "xdevui_search_tokens", body: "Design tokens by name or usage, with the value per theme and when to use each.", terms: ["token", "per theme", "usage"] },
  { name: "xdevui_list_icons", body: "Icon names accepted by Icon, Button, IconButton and the ActivityBar.", terms: ["24 grid", "stroke 1.75", "currentColor"] },
  { name: "xdevui_get_guidelines", body: "Design-system guidance as markdown, one section at a time.", terms: ["markdown", "sections", "rules"] },
  { name: "xdevui_search_docs", body: "Full-text search over every README and guideline, with the source of each line.", terms: ["full text", "source", "line"] },
];
