import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Toolbar } from "./Toolbar";

const meta = {
  title: "Navigation/Toolbar",
  component: Toolbar,
  args: {
    title: "Changes",
    count: 12,
    actions: (
      <>
        <IconButton icon="plus" label="Stage all" />
        <IconButton icon="search" label="Filter changes" />
        <IconButton icon="more" label="More actions" />
      </>
    ),
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PaneHead: Story = {};
export const Bulk: Story = {
  args: {
    variant: "bulk",
    title: "3 selected",
    count: undefined,
    label: "Selected worktrees",
    actions: (
      <>
        <Button variant="secondary">Archive</Button>
        <IconButton icon="close" label="Clear selection" />
      </>
    ),
  },
};
export const TitleOnly: Story = { args: { title: "Worktrees", count: 4, actions: undefined } };
