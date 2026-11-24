import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ToggleButton } from "./ToggleButton";

const meta = {
  title: "Inputs/ToggleButton",
  component: ToggleButton,
  args: { pressed: false, children: "apps:read" },
} satisfies Meta<typeof ToggleButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pressed: Story = { args: { pressed: true, children: "apps:write" } };
export const Warning: Story = { args: { tone: "warning", children: "workspace:delete", title: "Only an owner can grant this" } };
export const WarningPressed: Story = { args: { tone: "warning", pressed: true, children: "workspace:delete" } };
export const Disabled: Story = { args: { disabled: true, pressed: true, children: "apps:read" } };
export const Medium: Story = { args: { size: "md", children: "Delete apps" } };
/** A row of permission toggles; one needs care. */
export const Row: Story = {
  render: () => {
    const perms = [
      { id: "apps:read", warn: false },
      { id: "apps:write", warn: false },
      { id: "workspace:delete", warn: true },
    ];
    const [on, setOn] = useState<string[]>(["apps:read"]);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {perms.map((p) => (
          <ToggleButton
            key={p.id}
            pressed={on.includes(p.id)}
            tone={p.warn ? "warning" : "default"}
            onPressedChange={(next) => setOn((cur) => (next ? [...cur, p.id] : cur.filter((x) => x !== p.id)))}
          >
            {p.id}
          </ToggleButton>
        ))}
      </div>
    );
  },
};
