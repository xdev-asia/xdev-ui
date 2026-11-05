import type { Meta, StoryObj } from "@storybook/react-vite";
import { Comment } from "./Comment";

const meta = {
  title: "Display/Comment",
  component: Comment,
  args: { author: "Maya Chen", time: "2h ago", children: "Why this change?" },
  argTypes: { state: { control: "inline-radio", options: [undefined, "resolved", "outdated"] } },
} satisfies Meta<typeof Comment>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OnALine: Story = { args: { location: "src/app.ts:12" } };
export const Bot: Story = { args: { author: "review-bot", bot: true, botLabel: "Bot" } };
export const Resolved: Story = { args: { state: "resolved", stateLabel: "Resolved" } };
export const Outdated: Story = { args: { state: "outdated", stateLabel: "Outdated" } };
