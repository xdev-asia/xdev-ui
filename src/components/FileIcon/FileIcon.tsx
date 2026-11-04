import type { CSSProperties, JSX } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

/** Colour family. CSS maps each one to a theme token, so both themes keep their contrast. */
export type FileTone =
  | "folder"
  | "folder-open"
  | "code"
  | "markup"
  | "style"
  | "data"
  | "doc"
  | "media"
  | "config"
  | "shell"
  | "test"
  | "plain";

export interface FileIconMatch {
  icon: IconName;
  tone: FileTone;
}

type Rule = readonly [IconName, FileTone];

const DIRS: Record<string, IconName> = {
  src: "folder-code", lib: "folder-code", app: "folder-code", apps: "folder-code", packages: "folder-package",
  components: "folder-code", pages: "folder-code", scripts: "folder-code", bin: "folder-code",
  ".git": "folder-git", ".github": "folder-git", ".gitlab": "folder-git",
  node_modules: "folder-package", vendor: "folder-package", dist: "folder-package", build: "folder-package", out: "folder-package",
  assets: "folder-image", public: "folder-image", static: "folder-image", images: "folder-image", img: "folder-image", icons: "folder-image",
  test: "folder-test", tests: "folder-test", __tests__: "folder-test", spec: "folder-test", e2e: "folder-test",
  config: "folder-config", ".vscode": "folder-config", ".claude": "folder-config", ".storybook": "folder-config", ".husky": "folder-config",
};

/** Whole file names win over extensions. Keys are lowercase. */
const NAMES: Record<string, Rule> = {
  "package.json": ["file-package", "data"],
  "package-lock.json": ["file-lock", "config"],
  "pnpm-lock.yaml": ["file-lock", "config"],
  "yarn.lock": ["file-lock", "config"],
  "bun.lockb": ["file-lock", "config"],
  "cargo.lock": ["file-lock", "config"],
  "cargo.toml": ["file-package", "data"],
  "go.mod": ["file-package", "data"],
  "go.sum": ["file-lock", "config"],
  dockerfile: ["file-config", "config"],
  makefile: ["file-terminal", "shell"],
  ".gitignore": ["file-git", "config"],
  ".gitattributes": ["file-git", "config"],
  ".gitmodules": ["file-git", "config"],
  ".env": ["file-key", "config"],
  ".npmrc": ["file-config", "config"],
  ".editorconfig": ["file-config", "config"],
  readme: ["file-info", "doc"],
  "readme.md": ["file-info", "doc"],
  license: ["file-text", "doc"],
  "license.md": ["file-text", "doc"],
  changelog: ["file-text", "doc"],
  "changelog.md": ["file-text", "doc"],
};

const EXTS: Record<string, Rule> = {};
const add = (rule: Rule, exts: string): void => {
  for (const e of exts.split(" ")) EXTS[e] = rule;
};
add(["file-code", "code"], "ts tsx mts cts js jsx mjs cjs py rb go rs java kt kts swift c h cc cpp hpp cs php lua dart scala ex exs zig vue svelte astro");
add(["file-code", "markup"], "html htm xml");
add(["file-image", "media"], "svg png jpg jpeg gif webp avif ico bmp");
add(["file-style", "style"], "css scss sass less styl");
add(["file-json", "data"], "json jsonc json5");
add(["file-data", "data"], "csv tsv sql db sqlite parquet");
add(["file-config", "config"], "yaml yml toml ini conf cfg properties");
add(["file-text", "doc"], "md mdx txt rst adoc pdf rtf doc docx");
add(["file-media", "media"], "mp3 wav ogg flac mp4 mov webm mkv");
add(["file-terminal", "shell"], "sh bash zsh fish ps1 bat cmd");
add(["file-lock", "config"], "lock");
add(["file-key", "config"], "pem key crt cer p12 env");
add(["file-zip", "plain"], "zip tar gz tgz bz2 xz 7z rar");
add(["file-diff", "code"], "diff patch");
add(["file-text", "plain"], "log woff woff2 ttf otf");

/** Picks the icon and tone for a tree row. Pure, so a file list can call it without rendering. */
export function fileIcon(name: string, kind: "file" | "dir" = "file", open = false): FileIconMatch {
  const base = (name.split(/[\\/]/).pop() ?? name).toLowerCase();
  if (kind === "dir") return { icon: DIRS[base] ?? (open ? "folder-open" : "folder"), tone: open ? "folder-open" : "folder" };
  const named = NAMES[base];
  if (named) return { icon: named[0], tone: named[1] };
  if (base.startsWith(".env.")) return { icon: "file-key", tone: "config" };
  if (/\.(test|spec)\.[a-z0-9]+$/.test(base)) return { icon: "file-check", tone: "test" };
  if (/^(tsconfig|jsconfig)(\..+)?\.json$/.test(base) || /\.config\.[a-z0-9]+$/.test(base)) return { icon: "file-config", tone: "config" };
  const dot = base.lastIndexOf(".");
  const rule = dot > 0 ? EXTS[base.slice(dot + 1)] : undefined;
  return rule ? { icon: rule[0], tone: rule[1] } : { icon: "file", tone: "plain" };
}

export interface FileIconProps {
  /** File or folder name; a path works too (only the last segment counts). */
  name: string;
  /** Default "file". */
  kind?: "file" | "dir";
  /** Expanded folder. Ignored for files. */
  open?: boolean;
  /** Default 16. */
  size?: number;
  /** Set only when the icon stands alone without the file name next to it. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function FileIcon({ name, kind = "file", open = false, size = 16, label, className, style }: FileIconProps): JSX.Element {
  const { icon, tone } = fileIcon(name, kind, open);
  return <Icon name={icon} size={size} label={label} className={cx("x-file-icon", className)} style={style} data-tone={tone} />;
}
