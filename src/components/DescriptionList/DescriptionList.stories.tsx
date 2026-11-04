import type { Meta, StoryObj } from "@storybook/react-vite";
import { DescriptionList } from "./DescriptionList";

const meta = {
  title: "Data/DescriptionList",
  component: DescriptionList,
  args: {
    items: [
      { term: "Email", value: "ada@example.com", mono: true },
      { term: "Role", value: "Owner" },
      { term: "Created", value: "4 Nov 2026" },
    ],
  },
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {};
export const Columns: Story = { args: { layout: "columns" } };
