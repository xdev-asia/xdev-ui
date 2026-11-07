import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Display/EmptyState",
  component: EmptyState,
  args: { title: "No changes in this worktree" },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {};
export const Center: Story = {
  args: {
    size: "center",
    icon: "branch",
    title: "No worktrees yet",
    hint: "Create one per task so agents never share a checkout.",
    actions: <Button variant="primary" icon="plus">New worktree</Button>,
  },
};
export const NoResults: Story = {
  args: {
    size: "center",
    icon: "search",
    title: "No settings match “proxy”",
    hint: "Try a shorter word, or browse the sections on the left.",
    actions: <Button variant="secondary">Clear search</Button>,
  },
};

export const WithSteps: Story = {
  args: {
    size: "center",
    icon: "folder",
    title: "Start your first session",
    hint: "Three steps and an agent is working in its own branch.",
    steps: [{ label: "Open a project folder", done: true }, { label: "Pick an agent" }, { label: "Start a session" }],
    actions: <Button variant="primary">Pick an agent</Button>,
  },
};
