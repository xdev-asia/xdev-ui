import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { IconButton } from "../IconButton/IconButton";
import { AgentRow } from "./AgentRow";

const meta = {
  title: "Display/AgentRow",
  component: AgentRow,
  args: { name: "Claude", cli: "claude", summary: "Sonnet 5.5 · work account", expanded: false, onToggle: fn(), actions: <IconButton icon="copy" label="Duplicate" /> },
} satisfies Meta<typeof AgentRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { expanded: true, children: "Profile form goes here." } };
export const OneOpenAtATime: Story = {
  render: () => {
    const [open, setOpen] = useState<string | null>("claude");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[["claude", "Claude"], ["codex", "Codex"]].map(([id, name]) => (
          <AgentRow key={id} name={name} cli={id} summary="Default model" expanded={open === id} onToggle={(x) => setOpen(x ? id : null)}>
            Profile form goes here.
          </AgentRow>
        ))}
      </div>
    );
  },
  args: { name: "", cli: "", expanded: false, onToggle: fn() },
};
