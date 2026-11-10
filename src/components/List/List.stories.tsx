import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListRow } from "../ListRow/ListRow";
import { List } from "./List";

const meta = {
  title: "Display/List",
  component: List,
  args: {
    children: [
      <ListRow key="a" as="li" title="Chrome on macOS" meta="Last active today" />,
      <ListRow key="b" as="li" title="xDev desktop · MacBook" meta="Last active yesterday" />,
    ],
  },
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {};
export const Loose: Story = { args: { gap: 2 } };
