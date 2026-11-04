import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalette } from "./CommandPalette";

const meta = {
  title: "Overlays/CommandPalette",
  component: CommandPalette,
  args: {
    filters: ["All", "Sessions", "Files", "Commands"],
    sections: [
      {
        title: "Sessions",
        rows: [
          { title: "login-retry", detail: "feat/login-retry · Claude", state: "working" },
          { title: "fix-ci-cache", detail: "fix/ci-cache · Codex", state: "waiting" },
          { title: "docs-sync", detail: "docs/sync · Claude", state: "done" },
        ],
      },
      {
        title: "Commands",
        rows: [
          { title: "New worktree from issue", icon: "branch" },
          { title: "Search in files", icon: "search" },
        ],
      },
    ],
  },
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithQuery: Story = { args: { defaultQuery: "log" } };
export const NoMatches: Story = { args: { defaultQuery: "zzz" } };
