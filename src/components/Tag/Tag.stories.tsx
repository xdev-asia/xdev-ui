import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Display/Tag",
  component: Tag,
  args: { children: "draft" },
  argTypes: { tone: { control: "inline-radio", options: ["default", "warn"] } },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Warn: Story = { args: { tone: "warn", children: "stale" } };
