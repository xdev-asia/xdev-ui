import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandMark } from "./BrandMark";

const meta = {
  title: "Brand/BrandMark",
  component: BrandMark,
  args: { variant: "tile", size: 64 },
  argTypes: { variant: { control: "inline-radio", options: ["mark", "tile", "lockup"] } },
} satisfies Meta<typeof BrandMark>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tile: Story = {};
export const Mark: Story = { args: { variant: "mark" } };
export const Lockup: Story = { args: { variant: "lockup", size: 40 } };
