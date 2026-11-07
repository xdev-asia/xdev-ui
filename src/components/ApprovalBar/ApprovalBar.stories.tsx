import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApprovalBar } from "./ApprovalBar";

const meta = {
  title: "Layout/ApprovalBar",
  component: ApprovalBar,
  args: {
    title: "Run a shell command",
    command: "pnpm test --filter @xdev-asia/ui",
    onAllow: () => {},
    onAlways: () => {},
    onDeny: () => {},
  },
} satisfies Meta<typeof ApprovalBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutAlways: Story = { args: { onAlways: undefined } };
export const Busy: Story = { args: { busy: true } };
