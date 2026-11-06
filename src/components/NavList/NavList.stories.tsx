import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NavList } from "./NavList";

const items = [
  { id: "general", label: "General" },
  { id: "agents", label: "Agents" },
  { id: "terminal", label: "Terminal" },
  { id: "git", label: "Git and worktrees" },
  { id: "keys", label: "Keyboard" },
  { id: "accounts", label: "Accounts" },
];

const meta = {
  title: "Navigation/NavList",
  component: NavList,
  args: { title: "Settings", items, value: "agents" },
} satisfies Meta<typeof NavList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Counts show matches while the settings search has a query. */
export const WithCounts: Story = {
  args: { items: items.map((it, i) => ({ ...it, count: [0, 3, 1, 2, 0, 0][i] })), value: "agents" },
};
export const Untitled: Story = { args: { title: undefined } };
export const Interactive: Story = {
  render: (args) => {
    const [v, setV] = useState("general");
    return <NavList {...args} value={v} onSelect={setV} />;
  },
};
/** The title is a Disclosure head that shows and hides the items. */
export const Collapsible: Story = { args: { title: "Content", collapsible: true, defaultOpen: true } };
/** `renderLink` hands each href item to a router link (here a plain anchor marked data-router). */
export const CustomLink: Story = {
  args: {
    items: items.map((it) => ({ ...it, href: `#${it.id}` })),
    renderLink: ({ item: _item, ...p }) => <a data-router="" {...p} />,
  },
};
