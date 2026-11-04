import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb";

const noop = (): void => {};

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [
      { label: "xdev", onClick: noop },
      { label: "apps/desktop/src", mono: true, onClick: noop },
      { label: "FileTree.tsx", mono: true },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FilePath: Story = {};
export const Settings: Story = {
  args: { items: [{ label: "Settings", href: "#settings" }, { label: "Agents", href: "#agents" }, { label: "Claude Code" }] },
};
export const Worktree: Story = {
  args: {
    items: [
      { label: "xdev-ui", onClick: noop },
      { label: "feat/new-components", mono: true, onClick: noop },
      { label: "src/components/Tabs", mono: true },
    ],
  },
};
