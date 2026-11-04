import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./Field";

const meta = {
  title: "Inputs/Field",
  component: Field,
  args: { label: "Branch name", placeholder: "feat/login-retry" },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Created from main in a new worktree." } };
export const WithError: Story = { args: { defaultValue: "feat/login retry", error: "Branch names cannot contain spaces." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "main" } };
