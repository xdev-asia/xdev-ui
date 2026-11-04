import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Toast } from "./Toast";

const meta = {
  title: "Status/Toast",
  component: Toast,
  args: { children: "Worktree feat/login-retry archived.", onDismiss: fn() },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = { args: { actionLabel: "Undo", onAction: fn() } };
export const Vietnamese: Story = {
  args: { children: "Đã lưu trữ worktree feat/login-retry.", actionLabel: "Hoàn tác", onAction: fn(), labels: { dismiss: "Đóng" } },
};
