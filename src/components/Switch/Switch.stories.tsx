import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

const meta = {
  title: "Inputs/Switch",
  component: Switch,
  args: { label: "Auto-accept edits" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Unlabelled: Story = { args: { label: undefined, "aria-label": "Sound" } };
export const WithHint: Story = { args: { label: "Weekly digest", hint: "A summary every Monday at 09:00." } };
export const HiddenLabel: Story = { args: { label: "Enabled", hideLabel: true, defaultChecked: true } };
