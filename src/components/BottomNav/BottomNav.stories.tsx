import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BottomNav } from "./BottomNav";

const items = [
  { id: "home", label: "Home", icon: "home" as const },
  { id: "sessions", label: "Sessions", icon: "terminal" as const, badge: 3 },
  { id: "board", label: "Board", icon: "tasks" as const },
  { id: "files", label: "Files", icon: "folder" as const },
];

const meta = {
  title: "Navigation/BottomNav",
  component: BottomNav,
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { items, value: "home", onChange: fn() },
} satisfies Meta<typeof BottomNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithMoreSheet: Story = {
  args: { more: { label: "More", icon: "more", items: [{ id: "settings", label: "Settings", icon: "settings" }, { id: "inbox", label: "Inbox", icon: "bell", badge: 120 }] } },
  render: (args) => {
    const [value, setValue] = useState("home");
    return <BottomNav {...args} value={value} onChange={setValue} />;
  },
};
