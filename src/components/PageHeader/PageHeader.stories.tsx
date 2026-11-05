import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { StatusDot } from "../StatusDot/StatusDot";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  args: { title: "Users", description: "People who can sign in to this workspace." },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { actions: <Button>Create user</Button> } };
export const WithMeta: Story = {
  args: {
    title: "Ada Lovelace",
    meta: <StatusDot tone="ok" label="Active" />,
    actions: (
      <>
        <Button variant="secondary">Suspend</Button>
        <Button>Edit user</Button>
      </>
    ),
  },
};
