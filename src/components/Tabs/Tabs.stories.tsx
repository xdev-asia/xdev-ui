import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./Tabs";

const items = [
  { id: "changes", label: "Changes", badge: 12 },
  { id: "checks", label: "Checks", badge: 1, badgeTone: "danger" as const },
  { id: "files", label: "Files" },
  { id: "notes", label: "Notes" },
];

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { items, label: "Worktree panel", defaultValue: "changes" },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {};
export const Pill: Story = {
  args: {
    variant: "pill",
    label: "Diff view",
    defaultValue: "split",
    items: [
      { id: "split", label: "Split" },
      { id: "unified", label: "Unified" },
    ],
  },
};
export const WithDisabled: Story = {
  args: { items: [...items.slice(0, 3), { id: "review", label: "Review", disabled: true }] },
};
/** Controlled, with linked tab panels. */
export const WithPanels: Story = {
  render: (args) => {
    const [tab, setTab] = useState("changes");
    return (
      <div>
        <Tabs {...args} value={tab} onChange={setTab} idPrefix="wt" />
        {args.items.map((t) => (
          <div key={t.id} role="tabpanel" id={`wt-panel-${t.id}`} aria-labelledby={`wt-tab-${t.id}`} hidden={t.id !== tab} style={{ padding: 12 }}>
            {t.id === "changes" ? "12 files changed in feat/login-retry." : t.id === "checks" ? "1 check failed: e2e (windows)." : `No ${t.id} yet.`}
          </div>
        ))}
      </div>
    );
  },
};
