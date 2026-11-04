import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RadioGroup } from "./RadioGroup";

const shells = [
  { value: "pwsh", label: "PowerShell" },
  { value: "bash", label: "Git Bash" },
  { value: "cmd", label: "Command Prompt" },
];

const meta = {
  title: "Inputs/RadioGroup",
  component: RadioGroup,
  args: { name: "shell", label: "Default shell", options: shells, defaultValue: "pwsh" },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const VerticalWithHints: Story = {
  args: {
    name: "run",
    label: "When a quick command runs",
    orientation: "vertical",
    defaultValue: "active",
    options: [
      { value: "active", label: "In the active session", hint: "Types into the focused terminal." },
      { value: "new", label: "In a new session", hint: "Opens a tab in the current worktree." },
      { value: "ask", label: "Ask every time" },
    ],
  },
};
export const DisabledOption: Story = {
  args: { options: [...shells.slice(0, 2), { value: "wsl", label: "WSL", hint: "Not installed", disabled: true }] },
};
export const Disabled: Story = { args: { disabled: true } };
export const Controlled: Story = {
  render: (args) => {
    const [v, setV] = useState("bash");
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <RadioGroup {...args} value={v} onChange={setV} />
        <small>Picked: {v}</small>
      </div>
    );
  },
};
