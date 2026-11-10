import type { Meta, StoryObj } from "@storybook/react-vite";
import { Identity } from "./Identity";

const meta = {
  title: "Display/Identity",
  component: Identity,
  args: { name: "Trần Đức Duy", detail: "duy@example.com" },
} satisfies Meta<typeof Identity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {};
export const Medium: Story = { args: { size: "md" } };
