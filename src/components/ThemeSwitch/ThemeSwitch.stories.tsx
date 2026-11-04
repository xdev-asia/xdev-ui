import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitch } from "./ThemeSwitch";

const meta = {
  title: "Inputs/ThemeSwitch",
  component: ThemeSwitch,
  args: { value: "system", onChange: () => {} },
} satisfies Meta<typeof ThemeSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Vietnamese: Story = {
  args: { value: "dark", labels: { group: "Giao diện", system: "Hệ thống", dark: "Tối", light: "Sáng" } },
};
export const Disabled: Story = { args: { disabled: true } };
