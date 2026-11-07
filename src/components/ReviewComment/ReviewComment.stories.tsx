import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReviewComment } from "./ReviewComment";

const meta = {
  title: "Display/ReviewComment",
  component: ReviewComment,
  args: {
    file: "src/session.ts",
    line: 42,
    author: "Maya Chen",
    time: "2h ago",
    body: "This retry never gives up. Cap it.",
    onResolve: fn(),
  },
} satisfies Meta<typeof ReviewComment>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSuggestion: Story = { args: { suggestion: "for (let i = 0; i < MAX_RETRIES; i++) {" } };
export const Resolved: Story = { args: { resolved: true, onReopen: fn() } };
