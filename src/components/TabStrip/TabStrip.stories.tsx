import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TabStrip } from "./TabStrip";

const meta = {
  title: "Navigation/TabStrip",
  component: TabStrip,
  parameters: { layout: "fullscreen" },
  args: {
    label: "Agent tabs",
    defaultSelected: "a",
    onSelect: fn(),
    onClose: fn(),
    onAdd: fn(),
    tabs: [
      { id: "a", name: "login-retry", state: "working", profile: "claude", color: 1 },
      { id: "b", name: "fix-ci-cache", state: "waiting", profile: "codex", color: 4, unread: true },
      { id: "c", name: "README.md", dirty: true },
      { id: "d", name: "docs-sync", state: "done", profile: "claude", color: 6 },
      { id: "e", name: "zsh", state: "exited" },
    ],
  },
} satisfies Meta<typeof TabStrip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SkippedAndFailed: Story = {
  args: {
    defaultSelected: "b",
    tabs: [
      { id: "a", name: "release-notes", skipped: true },
      { id: "b", name: "api-client", state: "failed", profile: "codex", color: 2 },
    ],
  },
};
/** Console page tabs: an icon per page, a pinned home tab, and the four looks. */
const pages = [
  { id: "/", name: "Dashboard", icon: "home" as const, pinned: true },
  { id: "/users", name: "Users", icon: "accounts" as const },
  { id: "/roles", name: "Roles", icon: "shield" as const },
  { id: "/settings", name: "Settings", icon: "sliders" as const },
];
export const Card: Story = { args: { tabs: pages, defaultSelected: "/users", variant: "card" } };
export const Plain: Story = { args: { tabs: pages, defaultSelected: "/users", variant: "plain" } };
export const Brisk: Story = { args: { tabs: pages, defaultSelected: "/users", variant: "brisk" } };
/** Drag a tab, or press Shift+Left / Shift+Right on it; the pinned home tab stays first. */
export const Reorderable: Story = { args: { tabs: pages, defaultSelected: "/users", onReorder: fn() } };
