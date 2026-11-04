import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionTile } from "./ActionTile";

const meta = {
  title: "Actions/ActionTile",
  component: ActionTile,
  args: { icon: "swap", title: "Hand off a task", description: "Move ownership to another agent with enough context.", onClick: () => {} },
} satisfies Meta<typeof ActionTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
/** A grid of tiles; each one opens a dialog or starts an action. */
export const Grid: Story = {
  render: () => (
    <div className="x-action-tiles">
      <ActionTile icon="swap" title="Hand off a task" description="Move ownership to another agent." onClick={() => {}} />
      <ActionTile icon="list-checks" title="Child agents in sequence" description="One phase after another." onClick={() => {}} />
      <ActionTile icon="branch" title="Child agents in parallel" description="Split non-overlapping work." onClick={() => {}} />
      <ActionTile icon="workflow" title="Child agents in worktrees" description="Each child gets its own worktree." onClick={() => {}} />
    </div>
  ),
};
