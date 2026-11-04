import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileIcon } from "./FileIcon";

const meta = {
  title: "Brand/FileIcon",
  component: FileIcon,
  args: { name: "index.ts" },
} satisfies Meta<typeof FileIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

const FILES = [
  "App.tsx", "server.go", "index.html", "theme.css", "data.json", "users.csv", "package.json", "pnpm-lock.yaml",
  "vite.config.ts", "README.md", "notes.txt", "logo.svg", "demo.mp4", "deploy.sh", "Button.test.tsx", ".env.local",
  ".gitignore", "release.zip", "fix.patch", "Makefile",
];
const DIRS = ["docs", "src", ".git", ".github", "node_modules", "assets", "tests", "config"];

export const Single: Story = {};
export const OpenFolder: Story = { args: { name: "src", kind: "dir", open: true } };
export const Catalogue: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, fontSize: 12 }}>
      {DIRS.map((d) => (
        <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FileIcon name={d} kind="dir" />
          {d}
        </span>
      ))}
      {FILES.map((f) => (
        <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FileIcon name={f} />
          {f}
        </span>
      ))}
    </div>
  ),
};
