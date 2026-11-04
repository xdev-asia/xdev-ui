import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta = {
  title: "Status/Spinner",
  component: Spinner,
  args: { label: "Loading usage" },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};
export const Medium: Story = { args: { size: "md", label: "Loading worktrees" } };
export const InlineWithText: Story = {
  render: (args) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <Spinner {...args} />
      Fetching usage for 3 accounts
    </span>
  ),
};
