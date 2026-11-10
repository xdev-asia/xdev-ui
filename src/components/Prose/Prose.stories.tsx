import type { Meta, StoryObj } from "@storybook/react-vite";
import { Prose } from "./Prose";

const meta = {
  title: "Display/Prose",
  component: Prose,
  args: {
    children: [
      <h1 key="h">Privacy</h1>,
      <p key="p">xDev operates this sign-in service. This page says what it stores and why.</p>,
      <h2 key="h2">What we store</h2>,
      <ul key="ul">
        <li>Your name</li>
        <li>Your email address</li>
      </ul>,
    ],
  },
} satisfies Meta<typeof Prose>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Article: Story = {};
