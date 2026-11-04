import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Kbd } from "../Kbd/Kbd";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  args: { content: "Copy the worktree path", children: <IconButton icon="copy" label="Copy path" /> },
  decorators: [(Story) => <div style={{ padding: 48 }}><Story /></div>],
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OnIconButton: Story = {};
export const Bottom: Story = { args: { placement: "bottom" } };
export const WithShortcut: Story = {
  args: {
    content: (
      <>
        Open the command palette <Kbd>Ctrl K</Kbd>
      </>
    ),
    children: <Button variant="secondary" icon="search">Commands</Button>,
  },
};
