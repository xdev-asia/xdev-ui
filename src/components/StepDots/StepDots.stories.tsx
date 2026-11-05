import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepDots } from "./StepDots";

const meta = {
  title: "Status/StepDots",
  component: StepDots,
  args: { total: 3, current: 2 },
} satisfies Meta<typeof StepDots>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const First: Story = { args: { current: 1 } };
export const Five: Story = { args: { total: 5, current: 4 } };
