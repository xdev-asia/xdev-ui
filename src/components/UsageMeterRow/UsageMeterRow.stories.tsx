import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { UsageMeterRow } from "./UsageMeterRow";

const meta = {
  title: "Display/UsageMeterRow",
  component: UsageMeterRow,
  args: {
    account: "claude-3",
    state: "ok",
    windows: [
      { label: "5 h", used: 42, resetText: "Resets in 2 h" },
      { label: "Week", used: 88, resetText: "Resets on Mon" },
    ],
  },
  argTypes: { state: { control: "select", options: ["ok", "limited", "error", "signedOut"] } },
} satisfies Meta<typeof UsageMeterRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LimitReached: Story = {
  args: { state: "limited", windows: [{ label: "5 h", used: 100, resetText: "Resets in 40 min" }] },
};
export const SignedOut: Story = {
  args: { state: "signedOut", windows: [], actions: <Button size="sm">Sign in</Button> },
};
