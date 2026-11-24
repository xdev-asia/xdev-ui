import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
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
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "main", mono: true } };
export const WithAction: Story = {
  args: { label: "Webhook secret", placeholder: undefined, mono: true, action: <Button variant="link">Generate</Button> },
};
export const WithEndUnit: Story = { args: { label: "Timeout", placeholder: "500", inputMode: "numeric", end: "ms", hint: "Time limit in milliseconds." } };
export const WithEndButton: Story = {
  args: { label: "API key", defaultValue: "sk-live-4f9a", readOnly: true, mono: true, end: <IconButton icon="copy" label="Copy key" size="sm" /> },
};
export const Password: Story = { args: { label: "Password", placeholder: undefined, type: "password", defaultValue: "correct horse", autoComplete: "new-password" } };
export const PasswordInvalid: Story = { args: { label: "Password", placeholder: undefined, type: "password", defaultValue: "abc", error: "Use at least 12 characters." } };
export const PasswordDisabled: Story = { args: { label: "Password", placeholder: undefined, type: "password", defaultValue: "secret", disabled: true } };
export const PasswordNoReveal: Story = { args: { label: "PIN", placeholder: undefined, type: "password", reveal: false } };
export const PasswordTranslated: Story = {
  args: { label: "Mật khẩu", placeholder: undefined, type: "password", labels: { show: "Hiện mật khẩu", hide: "Ẩn mật khẩu" } },
};
