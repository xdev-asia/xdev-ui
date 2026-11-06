import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";

const meta = {
  title: "Layout/Container",
  component: Container,
  args: { size: "md", children: "Content is capped at the container width and keeps a 16px gutter." },
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {};
export const Full: Story = { args: { size: "full" } };
