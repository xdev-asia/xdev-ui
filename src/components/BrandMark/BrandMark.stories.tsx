import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandMark } from "./BrandMark";

const meta = {
  title: "Brand/BrandMark",
  component: BrandMark,
  args: { variant: "tile", size: 64 },
  argTypes: {
    variant: { control: "inline-radio", options: ["mark", "tile", "lockup"] },
    system: { control: "inline-radio", options: ["xdev", "cleaner", "ui"] },
  },
} satisfies Meta<typeof BrandMark>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tile: Story = {};
export const Mark: Story = { args: { variant: "mark" } };
export const Lockup: Story = { args: { variant: "lockup", size: 40 } };
export const SmallTile: Story = { args: { size: 32 } };
export const SubSystem: Story = { args: { system: "ui" } };
export const SubSystemLockup: Story = { args: { variant: "lockup", size: 40, system: "cleaner" } };
