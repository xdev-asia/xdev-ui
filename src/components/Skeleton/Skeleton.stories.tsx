import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Status/Skeleton",
  component: Skeleton,
  args: { lines: 3, announce: true },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Lines: Story = {};
export const Block: Story = { args: { shape: "block", height: "120px" } };
export const Circle: Story = { args: { shape: "circle", height: "32px" } };
