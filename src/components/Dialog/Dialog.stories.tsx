import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Dialog } from "./Dialog";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  args: {
    title: "Archive worktree?",
    children: "feat/login-retry has 3 uncommitted files. They stay on disk until you remove the worktree.",
    confirmLabel: "Archive",
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Alert: Story = {
  args: { alert: true, title: "Remove worktree?", confirmLabel: "Remove", children: "This deletes the folder and its untracked files." },
};
export const NoCancel: Story = {
  args: { cancelLabel: null, title: "Update ready", confirmLabel: "Restart", children: "xDev installs the update on the next start." },
};
export const Danger: Story = {
  args: { alert: true, tone: "danger", title: "Delete user lan@example.com?", description: "Their sessions end now.", confirmLabel: "Delete user", children: "This cannot be undone." },
};
export const Busy: Story = {
  args: { alert: true, tone: "danger", busy: true, title: "Delete user lan@example.com?", confirmLabel: "Delete user", children: "This cannot be undone." },
};
