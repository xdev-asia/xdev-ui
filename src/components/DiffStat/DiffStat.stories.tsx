import type { Meta, StoryObj } from "@storybook/react-vite";
import { DiffStat } from "./DiffStat";

const meta = { title: "Display/DiffStat", component: DiffStat, args: { added: 128, removed: 14 } } satisfies Meta<typeof DiffStat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OnlyAdded: Story = { args: { added: 42, removed: 0 } };
export const Large: Story = { args: { added: 12840, removed: 3911 } };
