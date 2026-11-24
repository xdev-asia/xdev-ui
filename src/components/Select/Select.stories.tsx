import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta = {
  title: "Inputs/Select",
  component: Select,
  args: {
    "aria-label": "Agent profile",
    defaultValue: "claude",
    options: [
      { value: "claude", label: "Claude Code" },
      { value: "codex", label: "Codex" },
      { value: "custom", label: "Custom command" },
    ],
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm", "aria-label": "Status filter" } };
export const Grouped: Story = {
  args: {
    options: undefined,
    defaultValue: "running",
    "aria-label": "Status filter",
    children: (
      <>
        <option value="all">All statuses</option>
        <optgroup label="Open">
          <option value="running">Running</option>
          <option value="waiting">Waiting</option>
        </optgroup>
        <optgroup label="Closed">
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </optgroup>
      </>
    ),
  },
};
export const Labelled: Story = { args: { label: "Default profile", hint: "Used for new sessions." } };
export const Invalid: Story = { args: { label: "Default profile", error: "Pick a profile." } };
