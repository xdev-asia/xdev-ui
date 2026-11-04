import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ActivityBar } from "./ActivityBar";

const meta = {
  title: "Navigation/ActivityBar",
  component: ActivityBar,
  args: { active: "terminal", changeCount: 7, onSelect: fn() },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 420, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Vietnamese: Story = { args: { labels: { nav: "Ứng dụng", docs: "Tài liệu", changes: "Thay đổi" } } };
