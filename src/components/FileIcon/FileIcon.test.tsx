import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ICONS } from "../../icons";
import { FileIcon, fileIcon } from "./FileIcon";

describe("fileIcon", () => {
  it("maps extensions to a family", () => {
    expect(fileIcon("index.ts")).toEqual({ icon: "file-code", tone: "code" });
    expect(fileIcon("theme.css")).toEqual({ icon: "file-style", tone: "style" });
    expect(fileIcon("data.json")).toEqual({ icon: "file-json", tone: "data" });
    expect(fileIcon("logo.SVG")).toEqual({ icon: "file-image", tone: "media" });
    expect(fileIcon("run.sh")).toEqual({ icon: "file-terminal", tone: "shell" });
  });
  it("lets whole file names win over the extension", () => {
    expect(fileIcon("package.json").icon).toBe("file-package");
    expect(fileIcon("pnpm-lock.yaml").icon).toBe("file-lock");
    expect(fileIcon("README.md").icon).toBe("file-info");
    expect(fileIcon("Dockerfile").icon).toBe("file-config");
    expect(fileIcon(".env.local").icon).toBe("file-key");
    expect(fileIcon("Button.test.tsx")).toEqual({ icon: "file-check", tone: "test" });
    expect(fileIcon("vite.config.ts").icon).toBe("file-config");
    expect(fileIcon("tsconfig.build.json").icon).toBe("file-config");
  });
  it("reads only the last path segment", () => {
    expect(fileIcon("src/components/Card.tsx").icon).toBe("file-code");
    expect(fileIcon("C:\repo\notes.md").icon).toBe("file-text");
  });
  it("picks folders by name and state", () => {
    expect(fileIcon("docs", "dir")).toEqual({ icon: "folder", tone: "folder" });
    expect(fileIcon("docs", "dir", true)).toEqual({ icon: "folder-open", tone: "folder-open" });
    expect(fileIcon("src", "dir").icon).toBe("folder-code");
    expect(fileIcon(".git", "dir").icon).toBe("folder-git");
    expect(fileIcon("node_modules", "dir").icon).toBe("folder-package");
  });
  it("falls back to the plain file", () => {
    expect(fileIcon("notes")).toEqual({ icon: "file", tone: "plain" });
    expect(fileIcon("archive.unknownext")).toEqual({ icon: "file", tone: "plain" });
  });
  it("only returns registered icon names", () => {
    const names = ["a.ts", "a.html", "a.css", "a.json", "a.csv", "a.yaml", "a.md", "a.png", "a.mp4", "a.sh", "a.lock", "a.pem", "a.zip", "a.patch", "a.log", "a.test.ts", "x"];
    for (const n of names) expect(ICONS, n).toHaveProperty([fileIcon(n).icon]);
    for (const d of ["src", ".git", "node_modules", "assets", "tests", "config", "other"]) expect(ICONS, d).toHaveProperty([fileIcon(d, "dir").icon]);
  });
});

describe("FileIcon", () => {
  it("renders a decorative svg with the tone", () => {
    const html = renderToStaticMarkup(<FileIcon name="App.tsx" />);
    expect(html).toMatch(/^<svg class="x-icon x-file-icon"/);
    expect(html).toContain('data-tone="code"');
    expect(html).toContain('aria-hidden="true"');
  });
  it("takes a label and extra class", () => {
    const html = renderToStaticMarkup(<FileIcon name="src" kind="dir" open label="Folder src" className="ws-tree-icon" size={14} />);
    expect(html).toContain('class="x-icon x-file-icon ws-tree-icon"');
    expect(html).toContain('aria-label="Folder src"');
    expect(html).toContain('data-tone="folder-open"');
    expect(html).toContain('width="14"');
  });
});
