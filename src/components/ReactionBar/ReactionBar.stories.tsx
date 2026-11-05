import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../Icon/Icon";
import { ReactionBar } from "./ReactionBar";

const meta = {
  title: "Display/ReactionBar",
  component: ReactionBar,
  args: {
    onToggle: () => {},
    items: [
      { key: "up", label: "Thumbs up", symbol: <Icon name="check-circle" />, count: 2, mine: true },
      { key: "heart", label: "Heart", symbol: <Icon name="star" />, count: 0, mine: false },
    ],
  },
} satisfies Meta<typeof ReactionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
