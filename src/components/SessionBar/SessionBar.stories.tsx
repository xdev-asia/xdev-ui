import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { SessionBar } from "./SessionBar";

const meta = {
  title: "Layout/SessionBar",
  component: SessionBar,
  args: { status: "working", model: "claude-opus-5-5", elapsed: 5 * 60_000, diff: { add: 42, del: 7 } },
  argTypes: { status: { control: "select", options: ["working", "failed", "waiting", "done", "idle", "exited"] } },
} satisfies Meta<typeof SessionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Working: Story = {};
export const NeedsYou: Story = { args: { status: "waiting" } };
export const WithActions: Story = {
  args: { actions: <Button size="sm" variant="secondary">Stop</Button> },
};
export const StateOnly: Story = { args: { status: "idle", model: undefined, elapsed: undefined, diff: undefined } };
