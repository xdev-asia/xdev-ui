import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LaunchCard, type LaunchValue } from "./LaunchCard";

const agents = [
  { value: "claude", label: "Claude" },
  { value: "codex", label: "Codex" },
];
const worktrees = [
  { value: "main", label: "main" },
  { value: "feat-a", label: "feat/a" },
];
const models = [
  { value: "opus", label: "Opus" },
  { value: "sonnet", label: "Sonnet" },
];

const meta = {
  title: "Layout/LaunchCard",
  component: LaunchCard,
  args: {
    agents,
    worktrees,
    models,
    value: { agent: "claude", worktree: "main", model: "opus", prompt: "" },
    onChange: () => {},
    onStart: () => {},
  },
} satisfies Meta<typeof LaunchCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<LaunchValue>(args.value);
    return <LaunchCard {...args} value={value} onChange={setValue} />;
  },
};
export const WithAdvanced: Story = { args: { advanced: <p>Permission mode and extra flags go here.</p> } };
