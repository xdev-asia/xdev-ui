import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorktreeRow } from "./WorktreeRow";

const meta = {
  title: "Display/WorktreeRow",
  component: WorktreeRow,
  args: {
    branch: "feat/login-retry",
    repo: "xdev",
    status: "working",
    agents: [{ profile: "claude", title: "Claude Code" }],
    diff: { add: 42, del: 7 },
    onSelect: () => {},
  },
  argTypes: { status: { control: "select", options: ["working", "failed", "waiting", "done", "idle", "exited"] } },
} satisfies Meta<typeof WorktreeRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const NeedsYou: Story = { args: { status: "waiting", agents: [{ profile: "claude", title: "Claude Code" }, { profile: "codex", title: "Codex" }] } };
export const NoDiff: Story = { args: { diff: undefined, status: "idle", agents: [] } };
